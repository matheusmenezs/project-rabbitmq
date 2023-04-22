import RabbitMQController from '../../rabbitmq/RabbitController';
import dotenv from 'dotenv';
import { generateReply } from '../util/generateReply';
dotenv.config(); //Load .env file

const uri = process.env.RABBITMQ_URI;
const controller = new RabbitMQController(uri);

(async () => {
  try {
    const exchange = process.env.EXCHANGE;
    const routingKey = process.env.ROUTING_KEY_MESSAGE;
    const queue = process.env.QUEUE_MESSAGE;

    await controller.connect();
    console.log('Connected to RabbitMQ - Message Consumer');

    //Consome a mensagem que foi publicada no exchange com o routing key respectivo
    await controller.consumeFromExchange(
      queue,
      exchange,
      routingKey,
      (message) => {
        console.log(
          ` [x] Message Received: ${message.content.toString()} \n Routing Key: ${
            message.fields.routingKey
          } \n Delivery Tag: ${message.fields.deliveryTag}`
        );

        //Cria objeto de resposta
        const replyMessage = generateReply('message', message.content.toString(), 'Message received');
        
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
