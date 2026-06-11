import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

const SENDER_EMAIL = "notificaciones@test-r83ql3pm1dzgzw1j.mlsender.net"; 

const mailerSend = new MailerSend({ apiKey: env.MAILERSEND_API_KEY });

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    
    const emailCliente = data.get('email') as string;
    const nombreEmpleado = data.get('nombreEmpleado') as string;
    const carnet = data.get('carnet') as string;
    const producto = data.get('producto') as string;
    const cantidad = data.get('cantidad') as string; // <--- NUEVO DATO

    if (!emailCliente || !nombreEmpleado || !carnet || !producto || !cantidad) {
      return fail(400, { error: 'Faltan datos requeridos' });
    }

    const sentFrom = new Sender(SENDER_EMAIL, "Logística y Envíos");
    const recipients = [new Recipient(emailCliente, "Cliente")];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`📦 MecamBlock Entrega Producto: ${producto} (${cantidad} uds)`)
      .setHtml(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2c3e50; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Confirmación de Entrega</h1>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
                <p style="color: #333; font-size: 18px;">
                    MecamBlock: 
                     Estimado Señor(a) se ha realizado la entrega del siguiente material:
                </p>

                <div style="background-color: #e8f6f3; border: 2px dashed #1abc9c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h2 style="margin: 0; color: #16a085;">${producto}</h2>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0 0 0;">x ${cantidad} Unidades</p>
                </div>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 14px;">
                    <p><strong>Entregado por:</strong> ${nombreEmpleado} (ID: ${carnet})</p>
                </div>
            </div>
        </div>
      `)
      .setText(`Entrega de ${cantidad} unidades de ${producto}.`);

    try {
      await mailerSend.email.send(emailParams);
      return { success: true };
    } catch (error) {
      console.error(error);
      return fail(500, { error: 'Error al enviar el correo.' });
    }
  }
} satisfies Actions;