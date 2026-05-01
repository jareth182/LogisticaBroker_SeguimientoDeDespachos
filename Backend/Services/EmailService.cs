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
}