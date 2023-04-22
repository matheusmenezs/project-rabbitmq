import RabbitMQController from '../../rabbitmq/RabbitController';
import dotenv from 'dotenv';
import { generateReply } from '../util/generateReply';
dotenv.config(); //Load .env file

const uri = process.env.RABBITMQ_URI;
const rabbitController = new RabbitMQController(uri);

(async () => {
  try {
    const exchange = process.env.EXCHANGE;
    const routingKey = process.env.ROUTING_KEY_MESSAGE;
    const queue = process.env.QUEUE_MESSAGE;

    await rabbitController.connect();
    console.log('Connected to RabbitMQ - Message Consumer');

    //Consome a mensagem que foi publicada no exchange com o routing key respectivo
    await rabbitController.consumeFromExchange(
      queue,
      exchange,
      routingKey,
      (message) => {
        try {
          if (message.content.toString().length === 0) {
            throw new Error('Message is empty');
          }

          console.log(
            ` [x] Message Received: ${message.content.toString()} \n Routing Key: ${
              message.fields.routingKey
            } \n Delivery Tag: ${message.fields.deliveryTag}`
          );

          //Confirma a mensagem recebida
          rabbitController.ack(message);

          //Cria objeto de resposta
          const replyMessage = generateReply(
            'message',
            message.content.toString(),
            'Message received'
          );

          //Envia mensagem de resposta para a fila definida no produtor
          rabbitController.sendToQueue(message.properties.replyTo, replyMessage, {
            correlationId: message.properties.correlationId,
          });
        } catch (error) {
          //Rejeita a mensagem caso ocorra algum erro
          rabbitController.nack(message);
          console.error(error);
        }
      },

      { noAck: false }
    );
    console.log('[*] Waiting for logs. To exit press CTRL+C');
  } catch (error) {
    console.error(error);
  }
})();
