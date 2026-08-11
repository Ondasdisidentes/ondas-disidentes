-- Los episodios ya no tienen foto propia: heredan el ícono de su programa
-- (ver ondas.css/home-client.tsx). Hasta que cada programa tenga su propia
-- foto real, todos usan la misma imagen por defecto (la que ya se mostraba
-- en "Últimos Episodios" del home).
update public.programas set icono = '/images/portada-default.webp';
