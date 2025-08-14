import { type NextRequest, NextResponse } from "next/server"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
} from "docx"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Leer el logo
    const logoPath = path.join(process.cwd(), "public", "logo.png")
    const logoBuffer = fs.readFileSync(logoPath)

    // Función para obtener los años únicos de intensificación y recursado
    const getYearsForStudy = (intensifySubjects: any[], recourseSubjects: any[]): string => {
      const years = new Set<string>()

      intensifySubjects.forEach((subject) => {
        if (subject.pendingYear) {
          const yearNum = subject.pendingYear.split(" ")[0]
          years.add(yearNum)
        }
      })

      recourseSubjects.forEach((subject) => {
        if (subject.year) {
          const yearNum = subject.year.split(" ")[0]
          years.add(yearNum)
        }
      })

      const sortedYears = Array.from(years).sort()
      if (sortedYears.length === 1) {
        return sortedYears[0]
      } else if (sortedYears.length === 2) {
        return `${sortedYears[0]} y ${sortedYears[1]}`
      } else {
        return sortedYears.slice(0, -1).join(", ") + " y " + sortedYears[sortedYears.length - 1]
      }
    }

    const yearsText = getYearsForStudy(formData.intensifySubjects, formData.recourseSubjects)

    // Función para formatear los miembros del EDTE con sus cargos
    const formatEdteMembers = (members: any[]): string => {
      return members
        .filter((member) => member.name.trim() && member.position.trim())
        .map((member) => `${member.name} (${member.position})`)
        .join(", ")
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Logo y header
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
            new Paragraph({
              children: [
                new TextRun({
                  text: "NOTIFICACIÓN DE LOS DÍAS Y HORARIOS DE LA",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "INTENSIFICACIÓN Y RECURSADO PARA 5 O MÁS MATERIAS PENDIENTES",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "DE APROBACIÓN Y ACREDITACIÓN",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Nuevo período después del título principal
            new Paragraph({
              children: [
                new TextRun({
                  text: `PERÍODO ${formData.periodo?.toUpperCase() || ""}`,
                  bold: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Institution and date
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
                              text: 'INSTITUCIÓN: Escuela Técnica N°6 "Ing. Juan V. Passalacqua" - Banfield - Lomas de Zamora',
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                      width: { size: 70, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: formData.date
                                ? format(new Date(formData.date), "dd 'de' MMMM 'de' yyyy", { locale: es })
                                : "",
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
            }),

            // Main notification text con años específicos y nombre en negrita
            new Paragraph({
              children: [
                new TextRun({
                  text: `Se notifica a ustedes que la/el estudiante `,
                }),
                new TextRun({
                  text: formData.studentName,
                  bold: true,
                }),
                new TextRun({
                  text: ` DNI ${formData.studentDNI || "_____________"} de ${formData.courseSection} deberá concurrir en el/los períodos de intensificación de la enseñanza y el estudio de ${yearsText} en los siguientes días y horarios:`,
                }),
              ],
              spacing: { before: 400, after: 400 },
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
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.BOTH, // Justificado
            }),

            // Intensify subjects con materias en negrita
            ...formData.intensifySubjects.flatMap((subject: any, index: number) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1} Materia pendiente de aprobación y acreditación: `,
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
                    text: `   Modelo bajo el cual se intensificará: ${subject.model}`,
                  }),
                ],
                alignment: AlignmentType.BOTH, // Justificado
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   Materia en que intensificará, año y sección: `,
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
                    text: `   DÍAS Y HORARIOS: ${subject.daysSchedule}     TURNO: ${subject.shift}`,
                  }),
                ],
                spacing: { after: 200 },
                alignment: AlignmentType.BOTH, // Justificado
              }),
            ]),

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
            ...formData.recourseSubjects.flatMap((subject: any, index: number) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1} Materia a recursar: `,
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
                    text: `   Año y sección en que recursa: ${subject.yearSection}`,
                  }),
                ],
                alignment: AlignmentType.BOTH, // Justificado
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   DÍAS Y HORARIOS: ${subject.daysSchedule} TURNO: ${subject.shift}`,
                  }),
                ],
                spacing: { after: 200 },
                alignment: AlignmentType.BOTH, // Justificado
              }),
            ]),

            // Cannot take subjects con leyenda en negrita
            ...(formData.cannotTakeSubjects
              ? [
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
                    spacing: { after: 800 },
                    alignment: AlignmentType.BOTH, // Justificado
                  }),
                ]
              : []),

            // Signatures mejoradas con tabla para separar
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
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
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "FIRMA EQUIPO DE CONDUCCIÓN",
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "",
                            }),
                          ],
                          spacing: { after: 400 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "________________________________",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "FIRMA Y ACLARACIÓN ADULTA/O RESPONSABLE",
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "",
                            }),
                          ],
                          spacing: { after: 400 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "________________________________",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${formData.studentName}_Notificacion.docx"`,
      },
    })
  } catch (error) {
    console.error("Error generating notification:", error)
    return NextResponse.json({ error: "Error generating document" }, { status: 500 })
  }
}
