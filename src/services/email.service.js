import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@wypozyczalnia.pl";
const FROM_NAME = process.env.FROM_NAME || "Wypożyczalnia Sprzętu";

// Konfiguracja transportu email
const createTransporter = () => {
  // W development używamy Ethereal Email (darmowy test SMTP)
  if (process.env.NODE_ENV === "development") {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }

  // W production używamy prawdziwego SMTP
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

/**
 * Wysyła email z potwierdzeniem rejestracji
 */
export const sendRegistrationConfirmation = async (user) => {
  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: user.email,
    subject: "Witamy w Wypożyczalni Sprzętu!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Witamy w Wypożyczalni!</h1>
        
        <p>Cześć <strong>${user.firstName}</strong>,</p>
        
        <p>Dziękujemy za rejestrację w naszej wypożyczalni sprzętu. Twoje konto zostało pomyślnie utworzone.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dane Twojego konta:</h3>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Imię i nazwisko:</strong> ${user.firstName} ${
      user.lastName
    }</li>
            <li><strong>Rola:</strong> ${
              user.role === "admin" ? "Administrator" : "Użytkownik"
            }</li>
          </ul>
        </div>
        
        <p>Możesz teraz:</p>
        <ul>
          <li>Przeglądać dostępny sprzęt</li>
          <li>Dokonywać rezerwacji</li>
          <li>Zarządzać swoimi rezerwacjami</li>
          <li>Dodawać opinie o wynajętym sprzęcie</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/equipment" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Przeglądaj sprzęt
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
          W razie pytań skontaktuj się z nami: <a href="mailto:pomoc@wypozyczalnia.pl">pomoc@wypozyczalnia.pl</a>
        </p>
        
        <p style="color: #6b7280; font-size: 12px;">
          Wypożyczalnia Sprzętu | Politechnika Częstochowska
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Registration email sent:", info.messageId);

    // W development pokazujemy preview URL
    if (process.env.NODE_ENV === "development") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Error sending registration email:", error);
    throw error;
  }
};

/**
 * Wysyła email z potwierdzeniem rezerwacji
 */
export const sendReservationConfirmation = async (reservation) => {
  const { user, equipment, dates } = reservation;

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: user.email,
    subject: `Potwierdzenie rezerwacji - ${equipment.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669; text-align: center;">Rezerwacja potwierdzona!</h1>
        
        <p>Cześć <strong>${user.firstName}</strong>,</p>
        
        <p>Twoja rezerwacja została pomyślnie złożona i oczekuje na zatwierdzenie przez administratora.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #059669; margin-top: 0;">Szczegóły rezerwacji:</h3>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
            <h4 style="margin: 0 0 10px 0;">${equipment.name}</h4>
            <p style="color: #6b7280; margin: 5px 0;">${
              equipment.description
            }</p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
              <div>
                <strong>Data rozpoczęcia:</strong><br>
                ${new Date(dates.startDate).toLocaleDateString("pl-PL")}
              </div>
              <div>
                <strong>Data zakończenia:</strong><br>
                ${new Date(dates.endDate).toLocaleDateString("pl-PL")}
              </div>
            </div>
          </div>
          
          <p><strong>Status:</strong> <span style="color: #f59e0b;">Oczekuje na zatwierdzenie</span></p>
          <p><strong>ID rezerwacji:</strong> #${reservation._id.slice(-6)}</p>
        </div>
        
        <h3>Co dalej?</h3>
        <ol>
          <li>Administrator sprawdzi dostępność sprzętu</li>
          <li>Otrzymasz email z potwierdzeniem lub odrzuceniem</li>
          <li>Jeśli zostanie zatwierdzona, będziesz mógł odebrać sprzęt w ustalonym terminie</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/reservations" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Zobacz moje rezerwacje
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
          W razie pytań skontaktuj się z nami: <a href="mailto:pomoc@wypozyczalnia.pl">pomoc@wypozyczalnia.pl</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Reservation confirmation email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending reservation email:", error);
    throw error;
  }
};

/**
 * Wysyła email o zmianie statusu rezerwacji
 */
export const sendReservationStatusUpdate = async (
  reservation,
  oldStatus,
  reason
) => {
  const { user, equipment, status } = reservation;

  const statusNames = {
    pending: "Oczekująca",
    approved: "Zatwierdzona",
    rented: "Wynajęta",
    completed: "Zakończona",
    cancelled: "Anulowana",
  };

  const statusColors = {
    pending: "#f59e0b",
    approved: "#059669",
    rented: "#2563eb",
    completed: "#6b7280",
    cancelled: "#dc2626",
  };

  let statusMessage = "";
  let nextSteps = "";

  switch (status) {
    case "approved":
      statusMessage = "Twoja rezerwacja została zatwierdzona!";
      nextSteps = `
        <p><strong>Następne kroki:</strong></p>
        <ol>
          <li>Zgłoś się do wypożyczalni w ustalonym terminie</li>
          <li>Zabierz dokument tożsamości</li>
          <li>Odbierz sprzęt i podpisz protokół wydania</li>
        </ol>
      `;
      break;
    case "rented":
      statusMessage = "Sprzęt został wydany!";
      nextSteps = `
        <p><strong>Pamiętaj:</strong></p>
        <ul>
          <li>Zwróć sprzęt w ustalonym terminie</li>
          <li>Zachowaj sprzęt w dobrym stanie</li>
          <li>W razie problemów skontaktuj się z nami</li>
        </ul>
      `;
      break;
    case "completed":
      statusMessage = "Wypożyczenie zakończone!";
      nextSteps = `
        <p>Dziękujemy za skorzystanie z naszych usług!</p>
        <p>Możesz teraz dodać opinię o wynajętym sprzęcie.</p>
      `;
      break;
    case "cancelled":
      statusMessage = "Rezerwacja została anulowana.";
      nextSteps = reason ? `<p><strong>Powód:</strong> ${reason}</p>` : "";
      break;
  }

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: user.email,
    subject: `Zmiana statusu rezerwacji - ${equipment.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${
          statusColors[status]
        }; text-align: center;">${statusMessage}</h1>
        
        <p>Cześć <strong>${user.firstName}</strong>,</p>
        
        <p>Status Twojej rezerwacji został zmieniony.</p>
        
        <div style="background: #f9fafb; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${equipment.name}</h3>
          <p><strong>ID rezerwacji:</strong> #${reservation._id.slice(-6)}</p>
          <p><strong>Poprzedni status:</strong> ${statusNames[oldStatus]}</p>
          <p><strong>Aktualny status:</strong> 
            <span style="color: ${statusColors[status]}; font-weight: bold;">
              ${statusNames[status]}
            </span>
          </p>
        </div>
        
        ${nextSteps}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/reservations/${reservation._id}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Zobacz szczegóły
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
          W razie pytań: <a href="mailto:pomoc@wypozyczalnia.pl">pomoc@wypozyczalnia.pl</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Status update email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending status update email:", error);
    throw error;
  }
};

/**
 * Wysyła przypomnienie o zbliżającej się dacie zwrotu
 */
export const sendReturnReminder = async (reservation, daysLeft) => {
  const { user, equipment, dates } = reservation;

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: user.email,
    subject: `Przypomnienie - zwrot sprzętu za ${daysLeft} dni`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b; text-align: center;">⏰ Przypomnienie o zwrocie</h1>
        
        <p>Cześć <strong>${user.firstName}</strong>,</p>
        
        <p>Przypominamy o zbliżającej się dacie zwrotu wynajętego sprzętu.</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${equipment.name}</h3>
          <p><strong>Data zwrotu:</strong> ${new Date(
            dates.endDate
          ).toLocaleDateString("pl-PL")}</p>
          <p><strong>Pozostało dni:</strong> <span style="color: #f59e0b; font-weight: bold;">${daysLeft}</span></p>
        </div>
        
        <h3>Nie zapomnij:</h3>
        <ul>
          <li>Zwróć sprzęt w pierwotnym stanie</li>
          <li>Zabierz wszystkie akcesoria</li>
          <li>Zgłoś się w godzinach pracy wypożyczalni</li>
          <li>W razie opóźnienia skontaktuj się z nami</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/reservations/${reservation._id}" 
             style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Zobacz szczegóły
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Kontakt: <a href="mailto:pomoc@wypozyczalnia.pl">pomoc@wypozyczalnia.pl</a> | Tel: +48 123 456 789
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Return reminder email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
};

// Test połączenia SMTP
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
    return false;
  }
};
