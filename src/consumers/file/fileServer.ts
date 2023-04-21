import RabbitMQController from '../../rabbitmq/RabbitController';
import { generateReply } from '../util/generateReply';
import {updateFile} from './service/processFile';
import dotenv from 'dotenv';
dotenv.config(); //Load .env file

const uri = process.env.RABBITMQ_URI;
const controller = new RabbitMQController(uri);

(async () => {
  try {
    const exchange = process.env.EXCHANGE;
    const routingKey = process.env.ROUTING_KEY_FILE;
    const queue = 'queue-file';

    await controller.connect();
    console.log('Connected to RabbitMQ - File Consumer');

    //Consome a mensagem que foi publicada no exchange com o routing key respectivo
    await controller.consumeFromExchange(
      queue,
      exchange,
      routingKey,
      async (message) => {
        console.log(
          ` [x] Message Received: ${message.content.toString()} \n Routing Key: ${
            message.fields.routingKey
          } \n Delivery Tag: ${message.fields.deliveryTag}`
        );

        //Chama função que processa a mensagem e salva no arquivo
        await updateFile(message.content.toString());

        //Cria objeto de resposta
        const replyMessage = generateReply('file', message.content.toString(), 'File updated');

        //Envia mensagem de resposta para a fila definida no produtor
        controller.sendToQueue(message.properties.replyTo, replyMessage, {
          correlationId: message.properties.correlationId,
        });
      },
      { noAck: true }
    );
    console.log('[*] Waiting for logs. To exit press CTRL+C');
  } catch (error) {
    console.error(error);
  }
})();
