const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, VerticalAlign, ShadingType, Footer, HeadingLevel, ExternalHyperlink } = require('docx');
const fs = require('fs');
const path = require('path');
const serviceDescriptions = require('./service_description.js');

/**
 * Pure DOCX Proposal Generator - Complete V1 Implementation
 * Generates perfectly formatted Word documents with A4 sizing and 1" margins
 * Matches v1.html exactly with all 6 pages
 */
class PureDocxProposalGenerator {
  constructor(data = {}) {
    this.data = {
      companyName: data.companyName || 'Firma',
      street: data.street || 'Straße',
      postalCode: data.postalCode || 'PLZ',
      city: data.city || 'Ort',
      country: data.country || 'Deutschland',
      date: data.date || 'XX.XX.2025',
      MM: data.MM || 'MM',
      DD: data.DD || 'DD',
      offerValidUntil: data.offerValidUntil || 'XX.XX.25',
      deliveryDays: data.deliveryDays || 'XXX',
      totalNetPrice: data.totalNetPrice || '0,00',
      totalVat: data.totalVat || '0,00',
      totalGrossPrice: data.totalGrossPrice || '0,00',
      signatureName: data.signatureName || 'Christopher Helm',
      images: data.images || [],
      services: data.services || [],
    };
    this.offerNumber = `2025-${this.data.MM}-${this.data.DD}-1`;
    
    // Use imported serviceDescriptions instead of local definition
    this.serviceDescriptions = serviceDescriptions;
    
    // Calculate pricing if services are provided
    if (this.data.services.length > 0) {
      this.calculatePricing();
    }
  }

  /**
   * Find service info by name (searches through imported serviceDescriptions)
   */
  findServiceByName(serviceName) {
    // Search through serviceDescriptions to find matching name
    for (const [serviceId, serviceData] of Object.entries(this.serviceDescriptions)) {
      if (serviceData.name === serviceName) {
        return serviceData;
      }
    }
    return null;
  }

  /**
   * Calculate total pricing from services
   */
  calculatePricing() {
    let totalNet = 0;
    
    this.data.services.forEach(service => {
      if (service.price && service.quantity) {
        const price = parseFloat(service.price.replace(',', '.'));
        const quantity = parseInt(service.quantity);
        totalNet += price * quantity;
      }
    });
    
    const totalVat = totalNet * 0.19;
    const totalGross = totalNet + totalVat;
    
    this.data.totalNetPrice = this.formatPrice(totalNet);
    this.data.totalVat = this.formatPrice(totalVat);
    this.data.totalGrossPrice = this.formatPrice(totalGross);
  }

  /**
   * Format number to German price format
   */
  formatPrice(number) {
    return number.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Standard page properties for all pages - A4 with 1" margins
   */
  getStandardPageProperties() {
    return {
      page: {
        width: 11906,      // A4: 8.27" = 11906 twips
        height: 16838,     // A4: 11.69" = 16838 twips
        margin: {
          top: 1440,       // 1" = 1440 twips
          right: 1440,
          bottom: 1440,
          left: 1440,
          footer: 720,     // Footer 0.5" from bottom
        },
      },
    };
  }

  /**
   * Create footer that appears on all pages
   */
  createFooter() {
    return new Footer({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                // Column 1: Company Info
                new TableCell({
                  width: { size: 33.33, type: WidthType.PERCENTAGE },
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: 'ExposeProfi.de', bold: true, size: 16 })], spacing: { after: 60 } }),
                    new Paragraph({ children: [new TextRun({ text: 'EPCS GmbH', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'GF: Christopher Helm', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'Bruder-Klaus-Str. 3a, 78467 Konstanz', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'HRB 725172, Amtsgericht Freiburg', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'St.-Nr: 0908011277', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'USt-ID: DE347265281', size: 14 })] }),
                  ],
                }),
                // Column 2: Bank Info
                new TableCell({
                  width: { size: 33.33, type: WidthType.PERCENTAGE },
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: 'Bankverbindung', bold: true, size: 16 })], spacing: { after: 60 } }),
                    new Paragraph({ children: [new TextRun({ text: 'Qonto (Banque de France)', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'IBAN DE62100101239488471916', size: 14 })] }),
                  ],
                }),
                // Column 3: Contact Info
                new TableCell({
                  width: { size: 33.34, type: WidthType.PERCENTAGE },
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: '', size: 14 })], spacing: { after: 60 } }),
                    new Paragraph({ children: [new TextRun({ text: 'Email: christopher.helm@exposeprofi.de', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'Web: www.exposeprofi.de', size: 14 })], spacing: { after: 30 } }),
                    new Paragraph({ children: [new TextRun({ text: 'Tel: +49-7531-1227491', size: 14 })] }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  /**
   * Create logo paragraph
   */
  createLogo(logoPath) {
    if (fs.existsSync(logoPath)) {
      try {
        const logoImage = fs.readFileSync(logoPath);
        return new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
          children: [
            new ImageRun({
              data: logoImage,
              transformation: { width: 320, height: 49 },
            }),
          ],
        });
      } catch (error) {
        console.warn('⚠️  Could not load logo, using text fallback');
      }
    }
    
    // Fallback if logo doesn't exist
    return new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
      children: [new TextRun({ text: 'ExposeProfi.de', size: 32, bold: true, color: '022e64' })],
    });
  }

  /**
   * Create cover page content
   */
  createCoverPage(logoPath) {
    return [
      // Logo
      this.createLogo(logoPath),

      // Header
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: 'ExposeProfi.de | EPCS GmbH | Bruder-Klaus-Straße 3a | 78467 Konstanz', size: 20, color: '022e64' })],
      }),

      // Recipient Address
      new Paragraph({
        spacing: { after: 400 },
        children: [
          new TextRun({ text: this.data.companyName, bold: true, size: 22, break: 1 }),
          new TextRun({ text: this.data.street, size: 22, break: 1 }),
          new TextRun({ text: `${this.data.postalCode} ${this.data.city}`, size: 22, break: 1 }),
          new TextRun({ text: this.data.country, size: 22, break: 1 }),
        ],
      }),

      // Date
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 600 },
        children: [new TextRun({ text: this.data.date, size: 22 })],
      }),

      // Offer Number
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: 'Angebot Nr. ', size: 32, bold: true }),
          new TextRun({ text: this.offerNumber, size: 32, bold: true }),
        ],
      }),

      // Introduction
      new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: 'Vielen Dank für Ihre Anfrage und Ihr damit verbundenes Interesse an einer Zusammenarbeit.', size: 22 })],
      }),

      // Benefits Title
      new Paragraph({
        spacing: { after: 300, before: 200 },
        children: [new TextRun({ text: 'Die Vorteile zusammengefasst, die Sie erwarten können:', bold: true, size: 22 })],
      }),

      // Benefits
      ...this.createBenefitsList(),
    ];
  }

  /**
   * Create benefits list
   */
  createBenefitsList() {
    const benefits = [
      { title: 'Fotorealismus:', text: 'Wir erstellen ausschließlich emotionale 3D-Visualisierungen der höchsten Qualitätsstufe.' },
      { title: 'Persönliche & individuelle Betreuung:', text: 'Sie erhalten bei jedem Projekt die Unterstützung von einem persönlichen Ansprechpartner, der die Visualisierungen individuell für Sie erstellt und immer per Telefon oder Email erreichbar ist.' },
      { title: 'Effiziente Prozesse & Schnelle Lieferzeit:', text: 'Wie Sie sehen, melden wir uns innerhalb von 24h mit einem Angebot bei Ihnen. Ihr Projekt verläuft ab Start ebenso reibungslos und Sie erhalten die Visualisierungen schnellstmöglich. Gänzlich ohne Kopfschmerzen.' },
      { title: 'Korrekturschleifen:', text: 'Bei 50% unserer Projekte benötigen unsere Kunden keine einzige Korrekturschleife, da wir von vorneherein ihre Wünsche perfekt umsetzen. Falls Sie dennoch Änderungswünsche haben sollten, bieten wir Ihnen ein eigenes Tool, bei dem Sie bequem innerhalb der Visualisierungen an die entsprechenden Stellen klicken und kommentieren können, was Sie geändert haben möchten. Hieraus ergibt sich für Sie eine Zeitersparnis verglichen mit Änderungswünschen per Email oder Telefon. Zudem gibt es durch unser Tool keine Missverständnisse bei der Umsetzung, wodurch Sie die finalen Visualisierungen noch schneller erhalten und das Projekt ganz reibungslos und stressfrei verläuft.' },
      { title: 'Preiswert:', text: 'Aufgrund unserer effizienten Prozesse bieten wir günstigere Preise als andere Anbieter mit vergleichbar hoher Qualität und zugleich eine bessere Betreuung.' },
    ];

    return benefits.map((benefit, index) => 
      new Paragraph({
        spacing: { after: 150 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: `${index + 1}. ${benefit.title}`, bold: true, size: 20 }),
          new TextRun({ text: ` ${benefit.text}`, size: 20 }),
        ],
      })
    );
  }

  /**
   * Create service table header
   */
  createServiceTableHeader() {
    return new Paragraph({
      spacing: { after: 250 },
      children: [new TextRun({ text: 'Basierend auf den zugesandten Unterlagen unterbreiten wir Ihnen folgendes Angebot:', bold: true, size: 20 })],
    });
  }

  /**
   * Create table header row
   */
  createTableHeaderRow() {
    return new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: 'f0f0f0', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Anzahl', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 28, type: WidthType.PERCENTAGE },
          shading: { fill: 'f0f0f0', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bezeichnung', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 54, type: WidthType.PERCENTAGE },
          shading: { fill: 'f0f0f0', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Beschreibung', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: 'f0f0f0', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Stückpreis netto', bold: true, size: 18 })] })],
        }),
      ],
    });
  }

  /**
   * Create one unified service table with all rows
   * Table will naturally flow across pages
   * NOW DYNAMIC: Only includes selected services
   */
  createUnifiedServiceTable() {
    const allRows = [
      this.createTableHeaderRow(),
      ...this.createDynamicServiceRows(),
    ];

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: allRows,
      cantSplit: false, // Allow table to break across pages
      margins: {
        bottom: 600, // Add bottom margin to prevent touching footer (600 twips = ~0.4 inches)
      },
    });
  }

  /**
   * Create dynamic service rows based on selected services
   */
  createDynamicServiceRows() {
    if (!this.data.services || this.data.services.length === 0) {
      // Return empty row if no services
      return [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnSpan: 4,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Keine Dienste ausgewählt', size: 18, italics: true, color: '666666' })],
                }),
              ],
            }),
          ],
        }),
      ];
    }

    const rows = [];

    this.data.services.forEach((service, index) => {
      const serviceInfo = this.findServiceByName(service.name);
      
      // Always start with default description
      const defaultDescription = serviceInfo ? serviceInfo.description : [];
      const customDescription = service.customDescription || [];
      
      // Combine default and custom descriptions
      const combinedDescription = [
        ...defaultDescription,
        ...customDescription
      ];
      
      // Note: link property may not exist in new service_description.js
      const link = serviceInfo ? serviceInfo.link : null;

      rows.push(
        new TableRow({
          children: [
            // Column 1: Quantity
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: String(service.quantity), size: 18 })],
                }),
              ],
            }),
            // Column 2: Designation
            new TableCell({
              width: { size: 28, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: service.name, size: 18, bold: true })],
                }),
              ],
            }),
            // Column 3: Description (bullet points with sub-bullets)
            this.createBulletListCell(combinedDescription, 54, link),
            // Column 4: Unit Price
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: service.unitPrice + ' €', size: 18 })],
                }),
              ],
            }),
          ],
        })
      );
    });

    return rows;
  }

  /**
   * Create a standard table cell with borders
   */
  createTableCell(text, options = {}) {
    const { bold = false, alignment = AlignmentType.LEFT, rowSpan = 1, width = 25, centerAlign = false } = options;

    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      rowSpan: rowSpan,
      verticalAlign: VerticalAlign.TOP,
      children: [
        new Paragraph({
          alignment: centerAlign ? AlignmentType.CENTER : alignment,
          children: [new TextRun({ text: text, bold: bold, size: 18 })],
        }),
      ],
    });
  }

  /**
   * Create bullet list cell with optional hyperlink support
   */
  /**
   * Create bullet list cell with optional hyperlink support and sub-bullets
   */
  createBulletListCell(items, width = 54, linkUrl = null) {
    let currentLinkUrl = linkUrl;
    const paragraphs = [];
    
    items.forEach(item => {
      // Handle nested structure (item with children/sub-bullets)
      if (typeof item === 'object' && item !== null && item.text) {
        // Main bullet
        const mainText = item.text;
        
        // Check for link markers in main text
        if (mainText.includes('Referenzen: Klick') || mainText.includes('Referenz: Klick')) {
          const isPlural = mainText.includes('Referenzen: Klick');
          const splitText = isPlural ? 'Referenzen: ' : 'Referenz: ';
          const parts = mainText.split(splitText);
          
          const children = [new TextRun({ text: parts[0] + splitText, size: 18 })];
          
          if (currentLinkUrl) {
            children.push(
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: 'Klick',
                    size: 18,
                    color: '0066cc',
                    underline: {},
                  }),
                ],
                link: currentLinkUrl,
              })
            );
          } else {
            children.push(new TextRun({ text: 'Klick', size: 18, color: '0066cc', underline: {} }));
          }
          
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 80 },
              children: children,
            })
          );
        } else {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 80 },
              children: [new TextRun({ text: mainText, size: 18 })],
            })
          );
        }
        
        // Add sub-bullets if they exist
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach(subItem => {
            paragraphs.push(
              new Paragraph({
                bullet: { level: 1 }, // Level 1 for sub-bullets
                spacing: { after: 80 },
                children: [new TextRun({ text: subItem, size: 18 })],
              })
            );
          });
        }
      } 
      // Handle string items (regular bullets)
      else if (typeof item === 'string') {
        // Check if item contains a link marker
        if (item.includes('Referenzen: Klick') || item.includes('Referenz: Klick')) {
          const isPlural = item.includes('Referenzen: Klick');
          const splitText = isPlural ? 'Referenzen: ' : 'Referenz: ';
          const parts = item.split(splitText);
          
          const children = [new TextRun({ text: parts[0] + splitText, size: 18 })];
          
          if (currentLinkUrl) {
            children.push(
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: 'Klick',
                    size: 18,
                    color: '0066cc',
                    underline: {},
                  }),
                ],
                link: currentLinkUrl,
              })
            );
          } else {
            children.push(new TextRun({ text: 'Klick', size: 18, color: '0066cc', underline: {} }));
          }
          
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 80 },
              children: children,
            })
          );
        } else {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 80 },
              children: [new TextRun({ text: item, size: 18 })],
            })
          );
        }
      }
    });
    
    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.TOP,
      children: paragraphs,
    });
  }

  /**
   * PAGE 1: Create exterior visualization service rows (3D-Außenvisualisierung)
   */
  createPage1ServiceRows() {
    // Links from links.js
    const exteriorLink = 'https://www.exposeprofi.de/3d-visualisierungen/architekturvisualisierungen';
    
    return [
      // SECTION 1: 3D-AUSSENVISUALISIERUNG BODENPERSPEKTIVE
      new TableRow({
        children: [
          this.createTableCell('XXX', { rowSpan: 6, width: 8, centerAlign: true }),
          this.createTableCell('3D-Außenvisualisierung Bodenperspektive\n(Projekt mit XX Wohneinheiten)', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XXX gerenderte Außenansichten des Objektes "XXX" aus den folgenden Bodenperspektiven (siehe rote Pfeile):',
            '○ xxx',
            'Fotorealistische Qualität',
            'Auf Wunsch eingefügt in von Ihnen zu liefernde Drohnenfotos oder schematische Modellierung der Umgebung',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            'Format: 2.500 x 1.500 px (300 DPI)',
            'Referenzen: Klick',
          ], 54, exteriorLink),
          this.createTableCell('20 €', { width: 10, centerAlign: true }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('Preisstaffelung:', { bold: true, width: 28 }),
          this.createTableCell('', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('1 Ansicht Netto:', { width: 28 }),
          this.createTableCell('20,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('2 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('18,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('3 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('16,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('4 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('14,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('', { width: 8 }),
          this.createTableCell('5 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('12,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      
      // SECTION 2: 3D-AUSSENVISUALISIERUNG VOGELPERSPEKTIVE
      new TableRow({
        children: [
          this.createTableCell('XXX', { rowSpan: 2, width: 8, centerAlign: true }),
          this.createTableCell('3D-Außenvisualisierung Vogelperspektive\n(Projekt mit XX Wohneinheiten)', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird 1x gerenderte Außenansicht des Objektes "XXX" aus der folgenden Vogelperspektive (siehe blauen Pfeil):',
            '○ xxx',
            'Fotorealistische Qualität',
            'Auf Wunsch eingefügt in von Ihnen zu liefernde Drohnenfotos oder schematische Modellierung der Umgebung',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            'Format: 2.500 x 1.500 px (300 DPI)',
            'Referenzen: Klick',
            'Nur in Kombination mit allen im Angebot aufgeführten Bodenperspektiven verfügbar',
          ], 54, exteriorLink),
          this.createTableCell(',00 €', { width: 10, centerAlign: true }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('Preisstaffelung:', { bold: true, width: 28 }),
          this.createTableCell('', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('', { width: 8 }),
          this.createTableCell('1 Ansicht Netto:', { width: 28 }),
          this.createTableCell('12,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
    ];
  }

  /**
   * PAGE 2: Create service rows for 3D-Grundriss and other services
   */
  createPage2ServiceRows() {
    // Links from links.js
    const interiorLink = 'https://www.exposeprofi.de/3d-visualisierungen/innenvisualisierungen';
    const grundriss3dLink = 'https://www.exposeprofi.de/3d-visualisierungen/3d-grundrisse';
    const grundriss2dLink = 'https://www.exposeprofi.de/workflow/2d-grundriss-designs';
    const homeStagingLink = 'https://www.exposeprofi.de/digitales-home-staging';
    const renovierungLink = 'https://www.exposeprofi.de/digitales-home-staging#referenzen-virtuelle-renovierung';
    
    return [
      // 3D-GRUNDRISS
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('3D-Grundriss', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XXX 3D-Grundrisse',
            'Hochwertig standardmöbliert',
            'Exclusive Qualität',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            '2.500px x 1.500 px bei 300 DPI',
            'Referenzen: Klick',
          ], 54, grundriss3dLink),
          this.createTableCell('69,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // 3D-GESCHOSSANSICHT
      new TableRow({
        children: [
          this.createTableCell('XX', { width: 8, centerAlign: true }),
          this.createTableCell('3D-Geschossansicht', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XXX 3D-Geschossansichten folgender Einheiten:',
            '○ XXX',
            'Hochwertig standardmöbliert',
            'Exclusive Qualität',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            '2.500px x 1.500 px bei 300 DPI',
          ], 54),
          this.createTableCell('199,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // 2D-GRUNDRISS
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('2D-Grundriss', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XXX 2D-Grundrisse',
            'Hochwertig standardmöbliert',
            'Exclusive Qualität',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            '2.500px x 1.500 px bei 300 DPI',
            'Referenzen: Klick',
          ], 54, grundriss2dLink),
          this.createTableCell('49,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // DIGITAL HOME STAGING
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('Digital Home Staging', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XXX Digital Home Staging Fotos der Räume:',
            '○ text',
            'Basiert auf vom Kunden bereitgestellten Fotos',
            'Individuell eingerichtet',
            'Fotorealistische Qualität',
            'Exakt identische Perspektive wie zugrundeliegende Fotos',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            'Referenzen: Klick',
          ], 54, homeStagingLink),
          this.createTableCell('99,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // DIGITALE RENOVIERUNG
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('Digitale Renovierung', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XXX Digitale Renovierungsfotos der Räume:',
            '○ text',
            'Basiert auf vom Kunden bereitgestellten Fotos',
            'Individuell eingerichtet',
            'Fotorealistische Qualität',
            'Exakt identische Perspektive wie zugrundeliegende Fotos',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            'Referenzen: Klick',
          ], 54, renovierungLink),
          this.createTableCell('139,00 €', { width: 10, centerAlign: true }),
        ],
      }),
    ];
  }

  /**
   * PAGE 3: Create service rows for 360° tours and videos
   */
  createPage3ServiceRows() {
    // Links from links.js
    const tour360Link = 'https://www.exposeprofi.de/3d-visualisierungen/virtuelle-rundgaenge';
    const video360Link = 'https://www.exposeprofi.de/3d-visualisierungen/architekturvisualisierungen#referenzen-virtueller-videorundgang';
    const slideshowLink = 'https://drive.google.com/file/d/1AW2T7wzx9-HxSOBx214YoM5MnXA3c8kp/view?usp=sharing';
    const exposeLink = 'https://www.exposeprofi.de/workflow/exposedesigns';
    
    return [
      // 360° TOUR INNEN
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('360° Tour Innen', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird 1x 360° Tour folgender Wohneinheit:',
            '○ text',
            'Begehung des kompletten Innenbereichs',
            'Individuell eingerichtet',
            'Einzigartige Technologie, da vollkommen frei bewegbar',
            'Intuitive Bedienung',
            'Passend für alle gängigen Endgeräte',
            'Inklusive Fensteraussicht (wahlweise mit beispielhafter oder Verwendung der tatsächlichen Aussicht mittels vom Auftraggeber gelieferten Bildern)',
            'Inkl. 2 Revisionsrunden⁽¹⁾',
            'Inkl. Hosting für 12 Monate⁽²⁾',
            'Referenz: Klick',
          ], 54, tour360Link),
          this.createTableCell('599,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // 360° VIDEO AUSSEN
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('360° Video Außen (nur in Kombination mit mind. 2x 3D-Außenvisualisierung)', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird 1x 360° Video-Tour des Objektes XXX',
            'Umgebung schematisch dargestellt',
            'Fotorealistische Qualität',
            'Länge ca. 90 Sekunden',
            'Inkl. 2 Revisionsrunden',
            'Referenz: Klick',
          ], 54, video360Link),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      
      // SLIDESHOW VIDEO
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('Slideshow Video', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird XX Slideshow-Video des Objektes',
            'Inkl. aller Visualisierungen und weiterer Fotos',
            'Professionell vertont und kommentiert',
            'Inkl. Untertiteln',
            'Referenzen: Klick',
          ], 54, slideshowLink),
          this.createTableCell('499,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // 3D-LAGEPLAN
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('3D-Lageplan', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird XXX 3D-Lageplan des Objektes in Draufsicht',
            'Exclusive Qualität',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
          ], 54),
          this.createTableCell('99,00 €', { width: 10, centerAlign: true }),
        ],
      }),
      
      // SOCIAL MEDIA PAKET
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('Social Media Paket', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird 1x Social Media Paket für die Visualisierung des Objektes, bestehend aus:',
            '○ Alle statischen Visualisierungen in den für Social Media Posts passenden Formaten',
            '○ Video in passendem Format',
            'Fotorealistische Qualität',
          ], 54),
          this.createTableCell('299,00 €', { width: 10, centerAlign: true }),
        ],
      }),
    ];
  }

  /**
   * PAGE 4: Create service rows for 3D interior visualization
   */
  createPage4ServiceRows() {
    // Link from links.js
    const interiorLink = 'https://www.exposeprofi.de/3d-visualisierungen/innenvisualisierungen';
    
    return [
      // 3D-INNENVISUALISIERUNG (Main row with description)
      new TableRow({
        children: [
          this.createTableCell('XX', { rowSpan: 11, width: 8, centerAlign: true }),
          this.createTableCell('3D-Innenvisualisierung', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert werden XX gerenderte Innenansichten der Räume:',
            '○ ...',
            'Fotorealistische Qualität',
            'Eingerichtet individuell nach ihren Wünschen (allerdings keine individuelle Modellierung konkreter Möbelstücke inkludiert)',
            'Falls Türen zwischen einzelnen Räumen zu sehen sind, werden diese als geschlossen dargestellt',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
            'Format: 2.500 x 1.500 px (300 DPI)',
            'Referenzen: Klick',
          ], 54, interiorLink),
          this.createTableCell(',00 €', { width: 10, centerAlign: true }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('Preisstaffelung:', { bold: true, width: 28 }),
          this.createTableCell('', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('1 Ansicht Netto:', { width: 28 }),
          this.createTableCell('399,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('2 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('299,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('3 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('289,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('4 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('269,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('5 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('259,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('6 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('249,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('7 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('239,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('8 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('229,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('9 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('219,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      new TableRow({
        children: [
          this.createTableCell('', { width: 8 }),
          this.createTableCell('≥10 Ansichten: Netto pro Ansicht:', { width: 28 }),
          this.createTableCell('199,00 €', { width: 54 }),
          this.createTableCell('', { width: 10 }),
        ],
      }),
      
      // 3D-VISUALISIERUNG TERRASSE
      new TableRow({
        children: [
          this.createTableCell('XXX', { width: 8, centerAlign: true }),
          this.createTableCell('3D-Visualisierung Terrasse', { bold: true, width: 28 }),
          this.createBulletListCell([
            'Geliefert wird 1x gerenderte Ansicht folgender Einheit:',
            '○ 1x Terrasse (Whg. XX)',
            'Fotorealistische Qualität',
            'Eingerichtet individuell nach ihren Wünschen (allerdings keine individuelle Modellierung konkreter Möbelstücke inkludiert)',
            'Inkl. 1 Revisionsrunde⁽¹⁾',
          ]),
          this.createTableCell(',00 €', { width: 10, centerAlign: true }),
        ],
      }),
    ];
  }

  /**
   * Create pricing summary section
   */
  createPricingSummary() {
    return [
      new Paragraph({
        spacing: { before: 400, after: 250 },
        children: [new TextRun({ text: 'Zusammenfassung:', bold: true, size: 24 })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        margins: {
          bottom: 600, // Add bottom margin to prevent touching footer
        },
        rows: [
          new TableRow({
            children: [
              this.createTableCell('', { width: 8 }),
              this.createTableCell('Gesamtpreis Netto', { bold: true, width: 28 }),
              this.createTableCell('', { width: 54 }),
              this.createTableCell(`${this.data.totalNetPrice} €`, { width: 10, centerAlign: true }),
            ],
          }),
          new TableRow({
            children: [
              this.createTableCell('', { width: 8 }),
              this.createTableCell('MwSt. (19 %)', { width: 28 }),
              this.createTableCell('', { width: 54 }),
              this.createTableCell(`${this.data.totalVat} €`, { width: 10, centerAlign: true }),
            ],
          }),
          new TableRow({
            children: [
              this.createTableCell('', { width: 8 }),
              this.createTableCell('Gesamtpreis Brutto', { bold: true, width: 28 }),
              this.createTableCell('', { width: 54 }),
              this.createTableCell(`${this.data.totalGrossPrice} €`, { width: 10, centerAlign: true }),
            ],
          }),
        ],
      }),
    ];
  }

  /**
   * Create perspective images section
   */
  createPerspectiveImagesSection() {
    const content = [
      // Recommended perspectives section
      new Paragraph({
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: 'Empfohlene Perspektiven Außen:', bold: true, size: 22 })],
      }),
    ];

    // Add each image with title, description, and the actual image
    if (this.data.images && this.data.images.length > 0) {
      this.data.images.forEach((imageData, index) => {
        // Image title
        if (imageData.title) {
          content.push(
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [new TextRun({ text: imageData.title, bold: true, size: 20 })],
            })
          );
        }

        // Image description
        if (imageData.description) {
          content.push(
            new Paragraph({
              spacing: { after: 150 },
              alignment: AlignmentType.JUSTIFIED,
              children: [new TextRun({ text: imageData.description, size: 18 })],
            })
          );
        }

        // The actual image
        if (imageData.imagePath && fs.existsSync(imageData.imagePath)) {
          try {
            const imageBuffer = fs.readFileSync(imageData.imagePath);
            content.push(
              new Paragraph({
                spacing: { after: 300 },
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 500,  // Adjust width as needed
                      height: 350, // Adjust height as needed
                    },
                  }),
                ],
              })
            );
          } catch (error) {
            console.warn(`⚠️  Could not load image: ${imageData.imagePath}`, error.message);
            // Add placeholder text if image fails to load
            content.push(
              new Paragraph({
                spacing: { after: 300 },
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `[Bild konnte nicht geladen werden: ${path.basename(imageData.imagePath)}]`, size: 18, italics: true, color: '999999' })],
              })
            );
          }
        } else if (imageData.imagePath) {
          // Image path provided but file doesn't exist
          content.push(
            new Paragraph({
              spacing: { after: 300 },
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `[Bild nicht gefunden: ${path.basename(imageData.imagePath)}]`, size: 18, italics: true, color: '999999' })],
            })
          );
        }
      });
    } else {
      // No images provided - show placeholder
      content.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: 'Png inserted here:', size: 20 })],
        })
      );
    }

    return content;
  }

  /**
   * Create terms and conditions section for Page 5
   */
  createTermsSection() {
    return [
      // Offer validity
      new Paragraph({
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({ text: 'Dieses Angebot ist gültig bis: ', bold: true, size: 22 }),
          new TextRun({ text: this.data.offerValidUntil, bold: true, size: 22 }),
        ],
      }),
      
      // Delivery way
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({ text: 'Lieferweg: ', bold: true, size: 20 }),
          new TextRun({ text: 'Digital via Email', size: 20 }),
        ],
      }),
      
      // Expected delivery date
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({ text: 'Voraussichtl. Leistungsdatum: ', bold: true, size: 20 }),
          new TextRun({ text: `${this.data.deliveryDays} Arbeitstage nach Auftragseingang und Erhalt aller Unterlagen und Informationen`, size: 20 }),
        ],
      }),
      
      // Delivery date with down payment
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: 'Voraussichtl. Leistungsdatum: ', bold: true, size: 20 }),
          new TextRun({ text: `${this.data.deliveryDays} Arbeitstage nach Eingang der Anzahlung i.H.v. 50% des Bruttopreises (N, NNN, NN EUR) und Erhalt aller Unterlagen und Informationen`, size: 20 }),
        ],
      }),
      
      // Signature
      new Paragraph({
        spacing: { before: 300, after: 400 },
        children: [
          new TextRun({ text: 'Mit freundlichen Grüßen\n', italics: true, size: 20 }),
          new TextRun({ text: this.data.signatureName, italics: true, size: 20 }),
        ],
      }),
      
      // Footnote (1)
      new Paragraph({
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: '(1):', bold: true, size: 18 })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ 
          text: 'Sollten Sie dadurch eine weitere Revision benötigen, die nicht durch uns verschuldet wurde, führen wir diese zum kostenlosen Grundpreis durchgehend. Bei komplexeren Änderungswünschen, welche eine deutlich längere Bearbeitungszeit benötigen, behalten wir uns das Recht vor, 50% der ursprünglichen Lieferzeit zu berechnen. Bei Hunderten von Projekten benötigen unsere Kunden im Schnitt unter 6 aller Fälle eine zweite Revision. 50% der ursprünglichen Lieferzeit dauert eine Revision durchschnittlich 2-3 Arbeitstage.', 
          size: 17 
        })],
      }),
      
      // Footnote (2)
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: '(2):', bold: true, size: 18 })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ 
          text: 'Sofern Sie nach 12 Monaten die Tour immer noch benutzen möchten, können Sie diese gerne verlängern, wobei eine geringe Gebühr für 12 Monate anfällt.', 
          size: 17 
        })],
      }),
      
      // Disclaimer
      new Paragraph({
        spacing: { before: 400, after: 100 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'cccccc' },
        },
        children: [new TextRun({ text: 'Haftungsausschluss:', bold: true, size: 18 })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ 
          text: 'Wir sind stets bestrebt, Ihre Visualisierungen so detailgetreu zu erstellen. Jeder dienen dieser Visualisierungen sind Künstlerische Schöpfungen welche subjektiven Haftung. Schäden auf Grund von Abweichungen hiernach.', 
          size: 17 
        })],
      }),
    ];
  }

  /**
   * Generate the complete document with all 6 pages
   * Uses one continuous table that flows naturally across pages
   */
  generate(logoPath = null) {
    const sections = [
      // SECTION 1: PAGE 0 - Cover Page
      {
        properties: this.getStandardPageProperties(),
        footers: { default: this.createFooter() },
        children: this.createCoverPage(logoPath),
      },
      
      // SECTION 2: PAGES 1-4 - One Continuous Service Table
      {
        properties: this.getStandardPageProperties(),
        footers: { default: this.createFooter() },
        children: [
          // Page break to start services
          new Paragraph({ pageBreakBefore: true, children: [] }),
          
          // Service table header text
          this.createServiceTableHeader(),
          
          // One unified table with all services - will flow across pages automatically
          this.createUnifiedServiceTable(),
        ],
      },
      
      // SECTION 3: PAGE 5 (Second-to-last) - Pricing Summary
      {
        properties: this.getStandardPageProperties(),
        footers: { default: this.createFooter() },
        children: [
          // Page break before pricing
          new Paragraph({ pageBreakBefore: true, children: [] }),
          
          // Pricing summary
          ...this.createPricingSummary(),
        ],
      },
      
      // SECTION 4: PAGE 6 (Second-to-last) - Perspective Images
      {
        properties: this.getStandardPageProperties(),
        footers: { default: this.createFooter() },
        children: [
          // Page break before images
          new Paragraph({ pageBreakBefore: true, children: [] }),
          
          // Perspective images with titles and descriptions
          ...this.createPerspectiveImagesSection(),
        ],
      },
      
      // SECTION 5: LAST PAGE - Terms and Conditions
      {
        properties: this.getStandardPageProperties(),
        footers: { default: this.createFooter() },
        children: [
          // Page break before terms
          new Paragraph({ pageBreakBefore: true, children: [] }),
          
          // Terms and conditions
          ...this.createTermsSection(),
        ],
      },
    ];

    return new Document({
      sections,
      styles: {
        default: {
          document: {
            run: {
              font: 'Calibri',
              size: 22, // 11pt
            },
            paragraph: {
              spacing: {
                line: 276, // 1.15 line spacing
                before: 0,
                after: 160,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Save the document to file
   */
  async save(outputPath, logoPath = null) {
    try {
      console.log('📄 Generating DOCX proposal...');
      const doc = this.generate(logoPath);
      
      console.log('📦 Packing document...');
      const buffer = await Packer.toBuffer(doc);
      
      console.log('💾 Writing to file...');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ DOCX file created successfully: ${outputPath}`);
      console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Error generating DOCX:', error);
      throw error;
    }
  }
}

// Example usage
if (require.main === module) {
  const sampleData = {
    companyName: 'Musterfirma GmbH',
    street: 'Musterstraße 123',
    postalCode: '12345',
    city: 'Berlin',
    date: '05.11.2025',
    MM: '11',
    DD: '05',
    offerValidUntil: '19.11.25',
    deliveryDays: '14',
    totalNetPrice: '1.500,00',
    totalVat: '285,00',
    totalGrossPrice: '1.785,00',
    signatureName: 'Christopher Helm',
  };

  const generator = new PureDocxProposalGenerator(sampleData);
  const outputPath = path.join(__dirname, 'output', 'pure-proposal.docx');
  const logoPath = path.join(__dirname, '6363f6e55943431f0f248941_logo exposeprofi blau-p-500.png');
  
  // Create output directory
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Starting pure DOCX generation...');
  console.log(`📂 Output: ${outputPath}`);
  console.log('');

  generator.save(outputPath, logoPath)
    .then(() => {
      console.log('');
      console.log('✨ Generation complete!');
      console.log('🎉 Open the file in Microsoft Word - it will be perfectly formatted!');
    })
    .catch(err => {
      console.error('');
      console.error('💥 Generation failed:', err);
      process.exit(1);
    });
}

module.exports = { PureDocxProposalGenerator };
