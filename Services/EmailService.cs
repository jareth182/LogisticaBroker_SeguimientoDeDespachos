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

    // 🔹 Método para enviar correos
    public async Task EnviarCorreoAsync(string destino, string asunto, string mensajeHtml)
    {
        var smtpServer = _config["EmailSettings:SmtpServer"];
        var port = int.Parse(_config["EmailSettings:Port"]);
        var senderEmail = _config["EmailSettings:SenderEmail"];
        var password = _config["EmailSettings:Password"];
        var senderName = _config["EmailSettings:SenderName"];

        var client = new SmtpClient(smtpServer, port)
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

    // 🔹 NUEVO: Plantilla HTML corporativa simplificada (T13)
    public string GenerarPlantillaBienvenida(string nombre, string correo, string password)
    {
        return $@"
        <html>
        <body style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; background-color:#f9f9f9; padding:40px; color: #333;'>
            <div style='max-width:600px; margin:auto; background:white; padding:40px; border-radius:8px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
            
                <h2 style='color:#1a3a5a; font-size: 24px; margin-bottom: 20px;'>Bienvenido a LogísticaBroker 🚀</h2>
    
                <p style='font-size: 16px;'>Hola <strong>{nombre}</strong>,</p>

                <p style='font-size: 15px; line-height: 1.6;'>
                    Tu cuenta ha sido creada exitosamente en nuestra plataforma de gestión de aduanas marítimas. 
                    A partir de este momento, podrás centralizar tu información comercial y hacer seguimiento a tus despachos de forma centralizada.
                </p>

                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;'>
                    <p style='margin-top: 0;'><strong>🔐 Credenciales de acceso temporal:</strong></p>
                    <ul style='list-style: none; padding-left: 10px; line-height: 1.8;'>
                        <li>🔹 <strong>Usuario:</strong> {correo}</li>
                        <li>🔹 <strong>Contraseña:</strong> <code style='background: #eee; padding: 2px 5px; border-radius: 4px;'>{password}</code></li>
                        <li>🔹 <strong>Enlace de acceso:</strong> <a href='https://app.logisticabroker.com/login' style='color: #007bff; text-decoration: none;'>https://app.logisticabroker.com/login</a></li>
                    </ul>
                </div>

                <p style='color:#c0392b; font-size: 14px; background-color: #fdf2f2; padding: 10px; border-left: 4px solid #c0392b;'>
                    <strong>⚠️ Importante:</strong> Por medidas de seguridad, el sistema te solicitará cambiar esta contraseña temporal obligatoriamente la primera vez que inicies sesión.
                </p>

                <div style='margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;'>
                    <p style='font-size:13px; color:#777; font-style: italic;'>
                        Este es un mensaje automático, por favor no responder. Si tienes problemas para ingresar, comunícate con tu asesor asignado.
                    </p>

                    <p style='font-size: 15px; margin-bottom: 0;'>Saludos,<br>
                    <span style='color: #1a3a5a; font-weight: bold;'>Equipo LogísticaBroker</span></p>
                </div>
            </div>
        </body>
        </html>
        ";
    }   
}