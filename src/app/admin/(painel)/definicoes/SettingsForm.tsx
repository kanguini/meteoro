'use client';

import { useActionState } from 'react';
import { Field, Panel, TextArea, type ActionState } from '../ui';
import { SaveBar } from '../SaveBar';
import { MediaPicker } from '../MediaPicker';
import { saveSettings } from './actions';

type Current = {
  phone: string;
  email: string;
  addressStreet: string;
  addressCity: string;
  slogan: string;
  hoursPt: string;
  hoursEn: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  coverImage: string;
  coverPoster: string;
  coverAltPt: string;
  coverAltEn: string;
};

export function SettingsForm({
  current,
  library,
}: {
  current: Current;
  library: { url: string; filename: string }[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSettings, {});

  return (
    <form action={formAction}>
      <Panel title="Contactos">
        <div className="admin-grid admin-grid--2">
          <Field label="Telefone" name="phone" defaultValue={current.phone} required hint="Como aparece no site. O link tel: é gerado automaticamente." />
          <Field label="Email" name="email" type="email" defaultValue={current.email} required />
          <Field label="Morada" name="addressStreet" defaultValue={current.addressStreet} />
          <Field label="Cidade" name="addressCity" defaultValue={current.addressCity} />
          <Field label="Horário (PT)" name="hoursPt" defaultValue={current.hoursPt} />
          <Field label="Horário (EN)" name="hoursEn" defaultValue={current.hoursEn} />
        </div>
      </Panel>

      <Panel title="Marca">
        <Field
          label="Slogan"
          name="slogan"
          defaultValue={current.slogan}
          hint="Aparece como título principal da capa e no rodapé. Não é traduzido."
        />
      </Panel>

      <Panel title="Capa da página inicial">
        <MediaPicker
          name="coverImage"
          label="Fotografia ou vídeo do topo"
          defaultValue={current.coverImage}
          library={library}
          allowVideo
          hint="Carregue do computador, escolha da biblioteca ou cole um endereço. Vídeo em MP4, WebM ou MOV até 40 MB — toca sozinho, sem som e em ciclo."
        />

        <div style={{ marginTop: '1.25rem' }}>
          <MediaPicker
            name="coverPoster"
            label="Imagem de recurso do vídeo"
            defaultValue={current.coverPoster}
            library={library}
            hint="Só usada quando a capa é vídeo: aparece enquanto ele carrega e fica no lugar dele em telemóveis que não o deixam tocar sozinho."
          />
        </div>

        <div className="admin-grid admin-grid--2" style={{ marginTop: '1.25rem' }}>
          <TextArea
            label="Descrição da imagem (PT)"
            name="coverAltPt"
            defaultValue={current.coverAltPt}
            rows={2}
            hint="Lida por leitores de ecrã e mostrada se a imagem não carregar."
          />
          <TextArea label="Descrição da imagem (EN)" name="coverAltEn" defaultValue={current.coverAltEn} rows={2} />
        </div>
      </Panel>

      <Panel title="Redes sociais">
        <div className="admin-grid admin-grid--3">
          <Field label="LinkedIn" name="linkedin" defaultValue={current.linkedin} placeholder="https://..." />
          <Field label="Instagram" name="instagram" defaultValue={current.instagram} placeholder="https://..." />
          <Field label="Facebook" name="facebook" defaultValue={current.facebook} placeholder="https://..." />
        </div>
      </Panel>

      <SaveBar state={state} />
    </form>
  );
}
