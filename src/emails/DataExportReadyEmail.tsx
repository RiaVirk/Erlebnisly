import { BaseLayout } from "./BaseLayout";

interface Props {
  userName: string;
  downloadUrl: string;
}

export function DataExportReadyEmail({ userName, downloadUrl }: Props) {
  return (
    <BaseLayout preview="Dein Datenexport ist bereit">
      <h1>Dein Datenexport ist bereit</h1>
      <p>Hallo {userName},</p>
      <p>dein persönlicher Datenexport (DSGVO Art. 20) steht zum Download bereit.</p>
      <a href={downloadUrl}>Daten herunterladen</a>
      <p><small>Der Link ist 24 Stunden gültig.</small></p>
    </BaseLayout>
  );
}
