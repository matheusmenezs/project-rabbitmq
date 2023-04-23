import RabbitMQController from '../rabbitmq/RabbitController';
import dotenv from 'dotenv';
dotenv.config(); // Load .env file

const uri = process.env.RABBITMQ_URI;
const rabbitController = new RabbitMQController(uri);

(async () => {
  const exchange = process.env.EXCHANGE;

  /**
   * Trecho de código que lê os argumentos da linha de comando
   * para definição do routing key e da mensagem.
   * @param {string} args Argumentos a partir do terceiro argumento da linha de comando
   * @param {string} routingKey Routing key que é passada como argumento (3º argumento)
   * @param {string} msg Mensagem que é passada como argumento (4º argumento)
   */
  const args = process.argv.slice(2);
  const routingKey = args.length > 0 ? args[0] : 'message.function.file'; 
  const msg = args.slice(1).join(' ') || 'Hello World!';

  try {
    await rabbitController.connect();
    console.log('[*] Waiting for logs. To exit press CTRL+C');
    console.log('Connected to RabbitMQ - Producer');

    //Cria uma fila exclusiva para receber a resposta do consumidor
    const replyQueue = await rabbitController.assertQueue('', {
      exclusive: true,
    });

    //Envia mensagem para o exchange
    await rabbitController.sendToExchange(exchange, routingKey, msg, {
      replyTo: replyQueue,
    });
    console.log('Message sent to RabbitMQ');

    //Consome a mensagem da fila de resposta
    await rabbitController.consumeFromQueue(replyQueue);

    //Espera 2 minutos para desconectar do RabbitMQ
    setTimeout(async () => {
      await rabbitController.close();
      console.log('Disconnected from RabbitMQ');
    }, 120000);
  } catch (error) {
    console.error(error);
  }
})();
