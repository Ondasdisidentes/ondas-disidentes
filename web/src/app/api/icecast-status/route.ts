// Consulta del lado del servidor el status-json.xsl de Icecast en giss.tv
// para saber si el mount de Ondas Disidentes está transmitiendo. Se hace acá
// (no desde el navegador) para evitar CORS. Ver docs/DOCUMENTO_MAESTRO.md §5.
//
// mount/stream_url viven en Supabase (tabla configuracion_stream, editable
// desde /admin/stream) en vez de variables de entorno, así el equipo puede
// actualizarla sin redeploy. statusUrl ya no es un campo propio — se deriva
// de stream_url (ver derivarStatusUrl en @/lib/data/stream-config).

import https from "node:https";
import { getStreamConfig } from "@/lib/data/stream-config";

// giss.tv:667 no manda el certificado intermedio de Let's Encrypt en el
// handshake TLS, solo el suyo propio (verificado a mano con
// `openssl s_client -showcerts`). Los navegadores y curl lo toleran porque
// el sistema operativo ya confía en la raíz nueva y la mantiene actualizada
// aparte, pero el paquete de certificados que trae Node.js compilado
// (usado tanto acá en dev como en las funciones de Vercel) todavía no la
// incluye — así que un fetch() normal a esa URL falla con
// "unable to verify the first certificate", y ese error termina
// degradando el chequeo a "no en vivo" siempre, transmita o no.
//
// Esto agrega como confianza extra, solo para esta conexión puntual, los
// dos certificados intermedios que el servidor debería mandar y no manda.
// No desactiva la verificación TLS: la cadena sigue teniendo que cerrar en
// una raíz real (ISRG Root X2, que Node ya trae de fábrica) para que la
// conexión se acepte. Certificados públicos, sin datos sensibles —
// descargados de la propia Authority Information Access de cada uno:
//   http://ye2.i.lencr.org/ — intermedio que firma el certificado de giss.tv
//   http://ye.i.lencr.org/  — cross-sign de esa CA hacia ISRG Root X2
const LENCR_YE2_INTERMEDIATE = `-----BEGIN CERTIFICATE-----
MIICjDCCAhGgAwIBAgIQTfOxXdbAeExQfNN7WObxFTAKBggqhkjOPQQDAzAuMQsw
CQYDVQQGEwJVUzENMAsGA1UEChMESVNSRzEQMA4GA1UEAxMHUm9vdCBZRTAeFw0y
NTA5MDMwMDAwMDBaFw0yODA5MDIyMzU5NTlaMDMxCzAJBgNVBAYTAlVTMRYwFAYD
VQQKEw1MZXQncyBFbmNyeXB0MQwwCgYDVQQDEwNZRTIwdjAQBgcqhkjOPQIBBgUr
gQQAIgNiAARxmrQzkdbEEL3MqXt3dJQttYc47axkdDTHud5TPqM2z5uSD5cmk0Wr
HlWXvnlvqBLqiB34kluxIbmMyAiq3/YD6e80/vV259K8XQIdjFXloYOa0mIU71f7
HQ09PvYDlw+jge4wgeswDgYDVR0PAQH/BAQDAgGGMBMGA1UdJQQMMAoGCCsGAQUF
BwMBMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFLlZ8o7PIvCG0zdI/3YU
GLqC2FWHMB8GA1UdIwQYMBaAFKPIJlqOoUzQNWP8myPIOq5W809WMDIGCCsGAQUF
BwEBBCYwJDAiBggrBgEFBQcwAoYWaHR0cDovL3llLmkubGVuY3Iub3JnLzATBgNV
HSAEDDAKMAgGBmeBDAECATAnBgNVHR8EIDAeMBygGqAYhhZodHRwOi8veWUuYy5s
ZW5jci5vcmcvMAoGCCqGSM49BAMDA2kAMGYCMQDIcnw5dcZLN9ffynXnnkLD/itS
JEycJPb3sRkzeqBowup7vOsAwaqoCnNn/jh9wycCMQCJM6CPlaOC4pQYYbJtVPYb
DKrIb2EKk5NpOpE6/XttQYZV/3gilB9l+Cc/DOVwmyg=
-----END CERTIFICATE-----`;

const LENCR_YE_ROOT_CROSSSIGN = `-----BEGIN CERTIFICATE-----
MIICpjCCAiugAwIBAgIRAIchZfw0tuX7qK3Vs3BftTowCgYIKoZIzj0EAwMwTzEL
MAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2VhcmNo
IEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDIwHhcNMjYwNTEzMDAwMDAwWhcN
MzIwOTAyMjM1OTU5WjAuMQswCQYDVQQGEwJVUzENMAsGA1UEChMESVNSRzEQMA4G
A1UEAxMHUm9vdCBZRTB2MBAGByqGSM49AgEGBSuBBAAiA2IABDwS/6vhrcVqcbBo
+wgdI3fwn9x7DNJJOY/lTOti0vkwuRN87RhEhTH17E7XyFjWsPYhIPt/wzOqxTd2
b+4ZJNy9ID04YywF9U5zasDVyGSNErVNtz8uSGh5izW87j77GaOB6zCB6DAOBgNV
HQ8BAf8EBAMCAQYwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDwYDVR0TAQH/BAUwAwEB
/zAdBgNVHQ4EFgQUo8gmWo6hTNA1Y/ybI8g6rlbzT1YwHwYDVR0jBBgwFoAUfEKW
rt5LSDv6kviejM9ti6lyN5UwMgYIKwYBBQUHAQEEJjAkMCIGCCsGAQUFBzAChhZo
dHRwOi8veDIuaS5sZW5jci5vcmcvMBMGA1UdIAQMMAowCAYGZ4EMAQIBMCcGA1Ud
HwQgMB4wHKAaoBiGFmh0dHA6Ly94Mi5jLmxlbmNyLm9yZy8wCgYIKoZIzj0EAwMD
aQAwZgIxAMU19WCtmxVND8UHBZRoma49Z7jPs64Dma0eTu1OChVbB/2J7GV3nvYK
Ax54uk1G9QIxAO0miLVJu8PLNiXXXkiE/gsK3CTRTF/aeo4bMX42Zw40csRU6AC2
6hSW1/IWaas6dg==
-----END CERTIFICATE-----`;

// Ya viene en tls.rootCertificates de Node, pero pasar `ca` a un
// https.Agent REEMPLAZA la lista de confianza por defecto en vez de
// sumarse a ella — hay que incluirla acá explícitamente para que la
// cadena tenga dónde cerrar.
const ISRG_ROOT_X2 = `-----BEGIN CERTIFICATE-----
MIICGzCCAaGgAwIBAgIQQdKd0XLq7qeAwSxs6S+HUjAKBggqhkjOPQQDAzBPMQswCQYDVQQG
EwJVUzEpMCcGA1UEChMgSW50ZXJuZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNV
BAMTDElTUkcgUm9vdCBYMjAeFw0yMDA5MDQwMDAwMDBaFw00MDA5MTcxNjAwMDBaME8xCzAJ
BgNVBAYTAlVTMSkwJwYDVQQKEyBJbnRlcm5ldCBTZWN1cml0eSBSZXNlYXJjaCBHcm91cDEV
MBMGA1UEAxMMSVNSRyBSb290IFgyMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEzZvVn4CDCuwJ
SvMWSj5cz3es3mcFDR0HttwW+1qLFNvicWDEukWVEYmO6gbf9yoWHKS5xcUy4APgHoIYOIvX
RdgKam7mAHf7AlF9ItgKbppbd9/w+kHsOdx1ymgHDB/qo0IwQDAOBgNVHQ8BAf8EBAMCAQYw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUfEKWrt5LSDv6kviejM9ti6lyN5UwCgYIKoZI
zj0EAwMDaAAwZQIwe3lORlCEwkSHRhtFcP9Ymd70/aTSVaYgLXTWNLxBo1BfASdWtL4ndQav
Ei51mI38AjEAi/V3bNTIZargCyzuFJ0nN6T5U6VR5CmD1/iQMVtCnwr1/q4AaOeMSQ+2b1tb
FfLn
-----END CERTIFICATE-----`;

const giscastAgent = new https.Agent({
  ca: [LENCR_YE2_INTERMEDIATE, LENCR_YE_ROOT_CROSSSIGN, ISRG_ROOT_X2],
});

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { agent: giscastAgent }, (res) => {
        const status = res.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`status-json.xsl respondió ${status}`));
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => (body += chunk));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

function escaparParaRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET() {
  // Separado del chequeo de "en vivo" en sí: si esto falla (p. ej. la
  // migración de configuracion_stream todavía no corrió en Supabase), no
  // hay streamUrl que devolver y no tiene sentido seguir.
  const config = await getStreamConfig().catch(() => null);
  if (!config || !config.statusUrl) {
    return Response.json({ live: false, streamUrl: config?.streamUrl ?? "" });
  }
  const { statusUrl, mount, streamUrl } = config;

  try {
    const body = await fetchText(statusUrl);

    // status-json.xsl lista TODAS las radios de esa instancia de giss.tv,
    // no solo la nuestra — y de tanto en tanto alguna de esas otras manda
    // un título con caracteres que Icecast no escapa bien, lo que rompe el
    // JSON del documento entero (visto en vivo: `"title": - ,` sin
    // comillas). Si dependiéramos de JSON.parse() del documento completo,
    // un dato corrupto de una radio ajena tumbaría nuestro propio chequeo.
    // Por eso se busca el mount directo en el texto crudo, sin necesitar
    // que TODO el documento sea JSON válido — más resiliente a algo que
    // no controlamos.
    const live = mount
      ? new RegExp(`"listenurl"\\s*:\\s*"[^"]*${escaparParaRegex(mount)}"`).test(body)
      : body.includes('"listenurl"');

    return Response.json({ live, streamUrl });
  } catch {
    // El chequeo de "en vivo" falló (giss.tv caído, timeout, etc.): se
    // degrada a "no en vivo", pero streamUrl sigue siendo válido aunque no
    // podamos confirmar el estado ahora mismo — no hay que perderlo.
    return Response.json({ live: false, streamUrl });
  }
}
