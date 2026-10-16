// Public contact details from https://sevielectro.com/.
export const business={name:'SeviElectro',phone:import.meta.env.PUBLIC_PHONE || '(+593) 98 412 0086',email:import.meta.env.PUBLIC_EMAIL || 'sevielectro81@gmail.com',secondaryEmail:'sevielectro_81@hotmail.com',location:'Quito, Ecuador',whatsapp:'https://wa.me/593984120086',facebook:'https://www.facebook.com/Sevielectro',instagram:'https://www.instagram.com/sevielectro/'};
export const phoneHref=`tel:${business.phone.replace(/[^+\d]/g,'')}`;
export const navigation=[['Inicio','inicio'],['Servicios','servicios'],['Clientes','clientes'],['Galería','galeria'],['Equipo','equipos'],['Contacto','contacto']];
