/**
 * Gera uma mensagem de resposta em formato de objeto e a transforma em string
 * @param  {string} consumer Nome do consumer que gerou a resposta
 * @param {string} message Mensagem que foi enviada para o consumer
 * @param {string} result Resultado da execução do consumer
 *
 * @returns {string} Mensagem de resposta em formato de string
 */
export function generateReply(
  consumer: string,
  message: string,
  result: string
) {
  const replyMessageObj = {
    consumer: consumer,
    message: message,
    result: result,
  };

  const replyMessage = JSON.stringify(replyMessageObj);

  return replyMessage;
}
