import FileSystem from 'fs';

export async function updateFile(messageContent: string) {
  FileSystem.appendFile("src/consumers/file/file.txt", `- ${messageContent}\n`, function (err) {
    if (err) throw err;

    console.log('Conteúdo adicionado ao arquivo com sucesso!');
  });
}
