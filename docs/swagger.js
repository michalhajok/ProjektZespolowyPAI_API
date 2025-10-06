import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wypożyczalnia Sprzętu API",
      version: "1.0.0",
      description: "REST API dla aplikacji wypożyczalni sprzętu",
      contact: {
        name: "Zespół projektowy",
        email: "contact@wypozyczalnia.pl",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/api",
        description: "Development server",
      },
      {
        url: "https://api.wypozyczalnia.pl/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            _id: {
              type: "string",
              description: "Unikalny identyfikator użytkownika",
            },
            email: {
              type: "string",
              format: "email",
              description: "Adres email użytkownika",
            },
            firstName: {
              type: "string",
              description: "Imię użytkownika",
            },
            lastName: {
              type: "string",
              description: "Nazwisko użytkownika",
            },
            phone: {
              type: "string",
              description: "Numer telefonu",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              default: "user",
              description: "Rola użytkownika",
            },
            isActive: {
              type: "boolean",
              default: true,
              description: "Status aktywności konta",
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              description: "Data ostatniego logowania",
            },
          },
        },
        Category: {
          type: "object",
          required: ["name"],
          properties: {
            _id: {
              type: "string",
              description: "Unikalny identyfikator kategorii",
            },
            name: {
              type: "string",
              description: "Nazwa kategorii",
            },
            description: {
              type: "string",
              description: "Opis kategorii",
            },
            isActive: {
              type: "boolean",
              default: true,
              description: "Status aktywności kategorii",
            },
          },
        },
        Equipment: {
          type: "object",
          required: ["name", "category"],
          properties: {
            _id: {
              type: "string",
              description: "Unikalny identyfikator sprzętu",
            },
            name: {
              type: "string",
              description: "Nazwa sprzętu",
            },
            description: {
              type: "string",
              description: "Opis sprzętu",
            },
            category: {
              $ref: "#/components/schemas/Category",
            },
            specifications: {
              type: "object",
              properties: {
                brand: { type: "string" },
                model: { type: "string" },
                serialNumber: { type: "string" },
                yearManufactured: { type: "number" },
                condition: {
                  type: "string",
                  enum: ["new", "excellent", "good", "fair", "poor"],
                },
                technicalSpecs: {
                  type: "object",
                  additionalProperties: { type: "string" },
                },
              },
            },
            availability: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: [
                    "available",
                    "reserved",
                    "rented",
                    "maintenance",
                    "retired",
                  ],
                },
                location: {
                  type: "object",
                  properties: {
                    branch: { type: "string" },
                    warehouse: { type: "string" },
                    shelf: { type: "string" },
                  },
                },
                quantity: { type: "number" },
                availableQuantity: { type: "number" },
              },
            },
            media: {
              type: "object",
              properties: {
                images: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      alt: { type: "string" },
                      isPrimary: { type: "boolean" },
                    },
                  },
                },
                documents: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      url: { type: "string" },
                      type: {
                        type: "string",
                        enum: ["manual", "warranty", "certificate"],
                      },
                    },
                  },
                },
              },
            },
            metadata: {
              type: "object",
              properties: {
                views: { type: "number", default: 0 },
                totalReservations: { type: "number", default: 0 },
                averageRating: { type: "number", default: 0 },
                reviewCount: { type: "number", default: 0 },
              },
            },
          },
        },
        Reservation: {
          type: "object",
          required: ["user", "equipment", "dates"],
          properties: {
            _id: {
              type: "string",
              description: "Unikalny identyfikator rezerwacji",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            equipment: {
              $ref: "#/components/schemas/Equipment",
            },
            dates: {
              type: "object",
              properties: {
                startDate: {
                  type: "string",
                  format: "date-time",
                },
                endDate: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "rented", "completed", "cancelled"],
            },
            history: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  changedBy: { type: "string" },
                  reason: { type: "string" },
                  changedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        Review: {
          type: "object",
          required: ["user", "equipment", "reservation", "rating"],
          properties: {
            _id: {
              type: "string",
              description: "Unikalny identyfikator recenzji",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            equipment: {
              $ref: "#/components/schemas/Equipment",
            },
            reservation: {
              type: "string",
              description: "ID powiązanej rezerwacji",
            },
            rating: {
              type: "number",
              minimum: 1,
              maximum: 5,
              description: "Ocena od 1 do 5",
            },
            title: {
              type: "string",
              description: "Tytuł recenzji",
            },
            comment: {
              type: "string",
              description: "Treść komentarza",
            },
            isVerified: {
              type: "boolean",
              default: true,
              description: "Status weryfikacji recenzji",
            },
            helpfulVotes: {
              type: "number",
              default: 0,
              description: "Liczba głosów pomocności",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["success", "error"],
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["success"],
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    limit: { type: "number" },
                    total: { type: "number" },
                    pages: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Endpointy związane z uwierzytelnianiem",
      },
      {
        name: "Users",
        description: "Zarządzanie użytkownikami",
      },
      {
        name: "Categories",
        description: "Zarządzanie kategoriami sprzętu",
      },
      {
        name: "Equipment",
        description: "Zarządzanie sprzętem",
      },
      {
        name: "Reservations",
        description: "System rezerwacji",
      },
      {
        name: "Reviews",
        description: "System recenzji i ocen",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Ścieżki do plików z dokumentacją
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
