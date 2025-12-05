require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { PureDocxProposalGenerator } = require('./pure-docx-generator');
const https = require('https');
const {getClientDetails} = require('./utils.js')
const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    fieldSize: 25 * 1024 * 1024  // 25MB field size limit (for base64 images in JSON)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded payload limit
app.use(express.static(__dirname));

// Serve the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'proposal-form.html'));
});

// API endpoint to generate proposal
app.post('/api/generate-proposal', upload.any(), async (req, res) => {
  try {
    console.log('📥 Received proposal request');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    // Parse JSON data from form
    const data = JSON.parse(req.body.data);
    const { clientInfo, projectInfo, services, pricing, signature, images: imageMetadata } = data;
    
    // Process uploaded images
    const images = [];
    
    // Handle file uploads (from direct form submission)
    if (req.files && req.files.length > 0 && imageMetadata && imageMetadata.length > 0) {
      req.files.forEach((file, index) => {
        if (imageMetadata[index]) {
          images.push({
            title: imageMetadata[index].title || '',
            description: imageMetadata[index].description || '',
            imagePath: file.path
          });
        }
      });
    } 
    // Handle base64 images (from preview page)
    else if (imageMetadata && imageMetadata.length > 0) {
      imageMetadata.forEach((imgData, index) => {
        if (imgData.imageData) {
          // Convert base64 to file
          const base64Data = imgData.imageData.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Save to temp file
          const uniqueSuffix = Date.now() + '-' + index;
          const ext = imgData.fileType ? imgData.fileType.split('/')[1] : 'png';
          const tempFilePath = path.join(uploadsDir, `${uniqueSuffix}.${ext}`);
          
          fs.writeFileSync(tempFilePath, buffer);
          
          images.push({
            title: imgData.title || '',
            description: imgData.description || '',
            imagePath: tempFilePath
          });
        }
      });
    }
    
    // Prepare data for DOCX generator
    const docxData = {
      companyName: clientInfo.companyName,
      street: clientInfo.street,
      postalCode: clientInfo.postalCode,
      city: clientInfo.city,
      country: clientInfo.country || 'Deutschland',
      date: projectInfo.date,
      MM: projectInfo.MM,
      DD: projectInfo.DD,
      offerValidUntil: projectInfo.offerValidUntil,
      deliveryDays: projectInfo.deliveryDays,
      totalNetPrice: pricing.totalNetPrice,
      totalVat: pricing.totalVat,
      totalGrossPrice: pricing.totalGrossPrice,
      signatureName: signature?.signatureName || 'Christopher Helm',
      images: images,
      services: services || []
    };
    
    console.log('📄 Generating DOCX with', images.length, 'images');
    
    // Generate filename
    const dateStr = `${projectInfo.date}`.replace(/\./g, '-');
    const safeCompanyName = clientInfo.companyName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const offerNumber = `2025-${projectInfo.MM}-${projectInfo.DD}-1`;
    const filename = `${dateStr}_Angebot_${offerNumber}_${safeCompanyName}.docx`;
    
    // Generate DOCX
    const generator = new PureDocxProposalGenerator(docxData);
    const outputPath = path.join(__dirname, 'output', filename);
    const logoPath = path.join(__dirname, '6363f6e55943431f0f248941_logo exposeprofi blau-p-500.png');
    
    await generator.save(outputPath, logoPath);
    
    console.log('✅ Proposal generated:', outputPath);
    
    // Clean up uploaded and temporary files after processing
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      });
    }
    
    // Clean up base64-converted image files
    images.forEach(img => {
      if (img.imagePath && img.imagePath.includes(uploadsDir)) {
        try {
          fs.unlinkSync(img.imagePath);
        } catch (err) {
          console.error('Error deleting temp image:', err);
        }
      }
    });

    // Send data to n8n webhook
    const webhookPayload = {
      offerNumber: offerNumber,
      clientInfo: {
        companyName: clientInfo.companyName,
        street: clientInfo.street,
        postalCode: clientInfo.postalCode,
        city: clientInfo.city,
        country: clientInfo.country || 'Deutschland'
      },
      projectInfo: {
        date: projectInfo.date,
        MM: projectInfo.MM,
        DD: projectInfo.DD,
        offerValidUntil: projectInfo.offerValidUntil,
        deliveryDays: projectInfo.deliveryDays
      },
      pricing: {
        totalNetPrice: pricing.totalNetPrice,
        totalVat: pricing.totalVat,
        totalGrossPrice: pricing.totalGrossPrice
      },
      signature: {
        signatureName: signature?.signatureName || 'Christopher Helm'
      },
      filename: filename,
      imagesIncluded: images.length
    };

    const webhookUrl = 'https://n8n.exposeprofi.de/webhook-test/556fd7ca-ef28-4d00-b98e-9271b07a7bad';
    const webhookData = JSON.stringify(webhookPayload);

    const urlObj = new URL(webhookUrl);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(webhookData)
      }
    };

    const webhookRequest = https.request(options, (webhookRes) => {
      let body = '';
      webhookRes.on('data', (chunk) => { body += chunk; });
      webhookRes.on('end', () => {
        console.log('✅ n8n webhook response:', webhookRes.statusCode, body);
      });
    });

    webhookRequest.on('error', (err) => {
      console.error('❌ Error sending to n8n webhook:', err.message);
    });

    webhookRequest.write(webhookData);
    webhookRequest.end();
    
    // Return success response
    res.json({
      success: true,
      message: 'Proposal generated successfully',
      filename: filename,
      fileUrl: `/output/${filename}`,
      offerNumber: offerNumber,
      clientName: clientInfo.companyName,
      totalAmount: pricing.totalGrossPrice,
      imagesIncluded: images.length
    });
    
  } catch (error) {
    console.error('❌ Error generating proposal:', error);
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Serve generated files
app.use('/output', express.static(path.join(__dirname, 'output')));

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'output', filename);
  res.download(filePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proposal Generator Server running on http://localhost:${PORT}`);
  console.log(`${PORT}`)
  console.log(`📋 Form available at: http://localhost:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/generate-proposal`);
});
