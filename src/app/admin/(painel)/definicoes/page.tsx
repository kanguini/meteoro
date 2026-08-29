import { db } from '@/db';
import { media, settings } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { site } from '@/lib/site';
import { AdminHead } from '../ui';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function DefinicoesPage() {
  await requireUser();

  const [row] = await db.select().from(settings).limit(1);
  const library = await db.select({ url: media.url, filename: media.filename }).from(media).limit(60);

  // Sem registo na base de dados mostramos o que o site serve hoje, para que
  // gravar pela primeira vez não apague nada.
  const current = row ?? {
    phone: site.phone,
    email: site.email,
    addressStreet: site.address.street,
    addressCity: site.address.city,
    slogan: site.slogan,
    hoursPt: site.hours.pt,
    hoursEn: site.hours.en,
    linkedin: site.social.linkedin,
    instagram: site.social.instagram,
    facebook: site.social.facebook,
    coverImage: '/images/hero-obra.jpg',
    coverAltPt: '',
    coverAltEn: '',
  };

  return (
    <>
      <AdminHead
        title="Definições"
        description="Contactos, slogan e imagem de capa. Aparecem no rodapé, na página de contacto e no topo da página inicial."
      />
      <SettingsForm current={current} library={library} />
    </>
  );
}
