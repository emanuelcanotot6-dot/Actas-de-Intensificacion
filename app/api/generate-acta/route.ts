import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Leer el logo
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Logo
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: {
                  width: 80,
                  height: 80,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            properties: {
              keepNext: true,
            },
          }),

          // Header simplificado
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "ACTA DE REUNIÓN DEL EQUIPO DE DEFINICIÓN DE",
                            bold: true,
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "TRAYECTORIAS EDUCATIVAS",
                            bold: true,
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Folio N°..................",
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400, after: 400 },
          }),

          // Meeting details con nombre en negrita
          new Paragraph({
            children: [
              new TextRun({
                text: `Reunión del Equipo de Definición de las Trayectorias Educativas de la E.E.S.T. n° 6 "Ing. Juan V. Passalacqua" - Banfield - Lomas de Zamora Turno ${formData.shift} del día ${formData.date ? format(new Date(formData.date), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '_____ de _______ de 2024'}`,
              }),
            ],
            spacing: { after: 400 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `En el día de la fecha se reúne el EDTE integrado por ${formData.edteMembers.filter(member => member.trim()).join(', ')}, como instancia de análisis y definición de las trayectorias de las/os estudiantes que, habiendo transitado todas las instancias de intensificación de la enseñanza y el estudio, y teniendo a la fecha más de 4 materias pendientes de aprobación y acreditación, requieren la toma de decisiones respecto de su continuidad de su escolarización.`,
              }),
            ],
            spacing: { after: 400 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `En referencia a la trayectoria de la/el estudiante `,
              }),
              new TextRun({
                text: formData.studentName,
                bold: true,
              }),
              new TextRun({
                text: ` DNI ${formData.studentDNI || '_____________'} de ${formData.courseSection}, turno ${formData.shift.toLowerCase()}, quien no ha aprobado y acreditado las siguientes materias:`,
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          // List of pending subjects con materias en negrita
          ...formData.intensifySubjects.map((subject: any) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `Materia `,
                }),
                new TextRun({
                  text: subject.pendingSubject,
                  bold: true,
                }),
                new TextRun({
                  text: ` Año del plan de estudio: ${subject.pendingYear}`,
                }),
              ],
              spacing: { after: 100 },
              alignment: AlignmentType.BOTH, // Justificado
            })
          ),

          ...formData.recourseSubjects.map((subject: any) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `Materia `,
                }),
                new TextRun({
                  text: subject.subjectName,
                  bold: true,
                }),
                new TextRun({
                  text: ` Año del plan de estudio: ${subject.year}`,
                }),
              ],
              spacing: { after: 100 },
              alignment: AlignmentType.BOTH, // Justificado
            })
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: "Considerando las particularidades de la trayectoria/asistencia/ calificación",
              }),
            ],
            spacing: { before: 400, after: 400 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Se define el siguiente Plan de Acompañamiento de Trayectorias Educativas que permita dar continuidad a sus aprendizajes y favorecer las condiciones que fortalezcan la construcción de saberes:",
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          // Leyenda en negrita para intensificación
          new Paragraph({
            children: [
              new TextRun({
                text: "La/el estudiante intensificará las siguientes materias:",
                bold: true,
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          // Intensify subjects details con materias en negrita
          ...formData.intensifySubjects.map((subject: any, index: number) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. Materia pendiente de aprobación y acreditación: `,
                }),
                new TextRun({
                  text: `${subject.pendingSubject}`,
                  bold: true,
                }),
                new TextRun({
                  text: ` (${subject.pendingYear})`,
                }),
              ],
              spacing: { before: 200 },
              alignment: AlignmentType.BOTH, // Justificado
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `    Modelo bajo el cual se intensificará: ${subject.model}`,
                }),
              ],
              alignment: AlignmentType.BOTH, // Justificado
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `    Materia en que intensificará, año y sección: `,
                }),
                new TextRun({
                  text: `${subject.intensifyIn}`,
                  bold: true,
                }),
                new TextRun({
                  text: ` (${subject.intensifyInYear})`,
                }),
              ],
              alignment: AlignmentType.BOTH, // Justificado
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `    DÍAS Y HORARIOS: ${subject.daysSchedule}     TURNO: ${subject.shift}`,
                }),
              ],
              spacing: { after: 200 },
              alignment: AlignmentType.BOTH, // Justificado
            }),
          ]).flat(),

          // Leyenda en negrita para recursado
          new Paragraph({
            children: [
              new TextRun({
                text: "Y recursará la/s siguiente/s materia/s:",
                bold: true,
              }),
            ],
            spacing: { before: 400, after: 200 },
            alignment: AlignmentType.BOTH, // Justificado
          }),

          // Recourse subjects con materias en negrita y sin "(con su año del plan de estudio)"
          ...formData.recourseSubjects.map((subject: any, index: number) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}) Materia a recursar: `,
                }),
                new TextRun({
                  text: `${subject.subjectName}`,
                  bold: true,
                }),
                new TextRun({
                  text: ` ${subject.year}`,
                }),
              ],
              alignment: AlignmentType.BOTH, // Justificado
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `    Año y sección en que recursa: ${subject.yearSection}`,
                }),
              ],
              alignment: AlignmentType.BOTH, // Justificado
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `    DÍAS Y HORARIOS: ${subject.daysSchedule} TURNO: ${subject.shift}`,
                }),
              ],
              spacing: { after: 200 },
              alignment: AlignmentType.BOTH, // Justificado
            }),
          ]).flat(),

          // Materias que no podrá cursar con leyenda en negrita
          ...(formData.cannotTakeSubjects ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Materias que NO podrá cursar este ciclo lectivo:",
                  bold: true,
                }),
              ],
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.BOTH, // Justificado
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: formData.cannotTakeSubjects,
                }),
              ],
              spacing: { after: 400 },
              alignment: AlignmentType.BOTH, // Justificado
            }),
          ] : []),

          // Signature
          new Paragraph({
            children: [
              new TextRun({
                text: "FIRMA DE LAS/OS INTEGRANTES DEL EDTE:",
                bold: true,
              }),
            ],
            spacing: { before: 800, after: 400 },
            alignment: AlignmentType.CENTER, // Mantener centrado
          }),

          ...formData.edteMembers.filter(member => member.trim()).map(() => 
            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________",
                }),
              ],
              spacing: { after: 200 },
              alignment: AlignmentType.CENTER, // Mantener centrado
            })
          ),
        ],
      }],
    })

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${formData.studentName}_Acta.docx"`,
      },
    })
  } catch (error) {
    console.error('Error generating acta:', error)
    return NextResponse.json({ error: 'Error generating document' }, { status: 500 })
  }
}
