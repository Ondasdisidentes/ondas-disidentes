-- Crea los 8 programas reales, cada uno vinculado a su radialista (ya
-- insertados en 0009_radialistas_seed.sql). Sin episodios todavía — se
-- agregan después desde /admin. Ícono por defecto para todos.
insert into public.programas (titulo, descripcion, icono, radialista_id)
select datos.titulo, datos.descripcion, '/images/portada-default.webp', r.id
from (
  values
    (
      'Radar de Identidades',
      'Revista sobre derechos, cuidado compartido y autonomía, con entrevistas a especialistas, testimonios en calles y mercados, y un consultorio con contactos de apoyo. Lidia es radialista sociocomunitaria y trabajó en emisoras locales de la zona.',
      'Lidia'
    ),
    (
      'Mujeres al Volante',
      'Magazine crítico sobre justicia social y derechos humanos, en cinco segmentos que van del editorial a la historia de vida. Marioly es periodista y condujo la primera temporada del programa en Radio Urbana en 2020, donde el storytelling le ganó audiencia de hombres y mujeres que buscaban justicia.',
      'Elena Marioly Jaimes Tapia'
    ),
    (
      'Raíces en Movimiento',
      'Documental narrativo sobre mujeres indígenas migrantes que dejaron sus comunidades para rehacer la vida en el periurbano: por qué partieron, qué encontraron y cómo mantienen vivas sus lenguas y saberes. Gloria lleva seis años en radio y más de cuatro produciendo podcast.',
      'Gloria Rosales Isla'
    ),
    (
      'Mujeres que transforman: voces del sur',
      'Entrevistas breves a artesanas, agricultoras, dirigentas vecinales, profesoras y jóvenes lideresas, con un cierre fijo donde la invitada deja un mensaje para otras mujeres. Vania hizo siete años de producción radial y comunicación comunitaria en Radio CEPJA.',
      'Vania Marisol López Bellido'
    ),
    (
      'Voces con Luz',
      'Un espacio para que las mujeres indígenas cuenten sus historias y compartan sus conocimientos en su lengua materna, con entrevistas a emprendedoras, productoras agrícolas y autoridades originarias. María Luz presenta noticias en quechua.',
      'María Luz Moya Vergara'
    ),
    (
      'Comunicación en Quechua',
      'Entrevista y narración en voz sobre interculturalidad y derechos, dirigido a las mujeres de las comunidades, los mercados y los barrios. Primitiva conduce programas de radio y quiere hacerlo en su idioma.',
      'Primitiva Martínez'
    ),
    (
      'Historias que Florecen',
      'La historia de vida de una mujer y el emprendimiento con el que sostiene su autonomía económica, en dos segmentos. Benita condujo una revista radial sobre derechos de las mujeres y llega convencida de que los medios tradicionales discriminan a los pensamientos minoritarios.',
      'Benita Díaz'
    ),
    (
      'Voces de mi tierra',
      'Sale a las comunidades a buscar y seleccionar historias, para hacer escuchar cada voz que allí se encuentra. Graciela coordina Radio Domingo Savio.',
      'Graciela Poma Ramallo'
    )
) as datos(titulo, descripcion, radialista_nombre)
join public.radialistas r on r.nombre = datos.radialista_nombre;
