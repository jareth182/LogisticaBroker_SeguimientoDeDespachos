using System.Net;
using System.Net.Mail;

namespace LogisticaBroker.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task EnviarCorreoAsync(string destino, string asunto, string mensajeHtml)
    {
        var smtpServer = _config["EmailSettings:SmtpServer"] ?? "";
        var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
        var senderEmail = _config["EmailSettings:SenderEmail"] ?? "";
        var password = _config["EmailSettings:Password"] ?? "";
        var senderName = _config["EmailSettings:SenderName"] ?? "LogisticaBroker";

        using var client = new SmtpClient(smtpServer, port)
        {
            Credentials = new NetworkCredential(senderEmail, password),
            EnableSsl = true
        };

        var mail = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = asunto,
            Body = mensajeHtml,
            IsBodyHtml = true
        };

        mail.To.Add(destino);

        await client.SendMailAsync(mail);
    }

    public string GenerarPlantillaBienvenida(string nombre, string correo, string password)
    {
        return $@"
        <html>
        <body style='font-family:Segoe UI; padding:20px;'>
            <h2>Bienvenido a LogisticaBroker 🚀</h2>
            <p>Hola <b>{nombre}</b></p>

            <p><b>Usuario:</b> {correo}</p>
            <p><b>Contraseña:</b> {password}</p>

            <p>Accede al sistema y cambia tu contraseña.</p>
        </body>
        </html>";
    }

    public string GenerarPlantillaRecuperacion(string nombre, string correo, string codigo)
    {
        return $@"
        <html>
        <body style='font-family:Segoe UI; padding:32px; background:#f5f7fa;'>
            <div style='max-width:480px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 2px 8px rgba(0,0,0,0.08);'>
                <div style='text-align:center; margin-bottom:24px;'>
                    <div style='display:inline-block; background:#1a2540; border-radius:10px; padding:12px 16px;'>
                        <span style='color:#ffffff; font-size:22px;'>🚚</span>
                    </div>
                    <h2 style='color:#1a2540; margin:16px 0 4px;'>Logística Broker Perú S.A.C.</h2>
                    <p style='color:#6b7280; font-size:13px; margin:0;'>Sistema de Gestión Institucional</p>
                </div>

                <h3 style='color:#1a2540; font-size:20px; margin-bottom:8px;'>Recuperación de Contraseña</h3>
                <p style='color:#374151;'>Hola <b>{nombre}</b>,</p>
                <p style='color:#374151;'>Recibimos una solicitud para restablecer el acceso a tu cuenta asociada al correo <b>{correo}</b>.</p>

                <div style='background:#f0f4f8; border-radius:8px; padding:16px; margin:20px 0; text-align:center;'>
                    <p style='color:#6b7280; font-size:13px; margin:0 0 8px;'>Tu código de recuperación es:</p>
                    <span style='font-size:28px; font-weight:bold; color:#1a2540; letter-spacing:4px;'>{codigo}</span>
                </div>

                <p style='color:#6b7280; font-size:13px;'>Este código tiene una validez de <b>30 minutos</b>. Si no solicitaste este correo, ignóralo.</p>
                <p style='color:#6b7280; font-size:13px; margin-top:16px;'>Para ingresar al sistema: <a href='http://localhost:5173' style='color:#3b82f6;'>http://localhost:5173</a></p>

                <hr style='border:none; border-top:1px solid #e5e7eb; margin:24px 0;'/>
                <p style='color:#9ca3af; font-size:11px; text-align:center; margin:0;'>© 2026 Logística Broker Perú S.A.C. — Todos los derechos reservados.</p>
            </div>
        </body>
        </html>";
    }
}