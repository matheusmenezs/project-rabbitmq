import RabbitMQController from '../../rabbitmq/RabbitController';
import { generateReply } from '../util/generateReply';
import calculateFunction from './service/processFunction';
import dotenv from 'dotenv';
dotenv.config(); //Load .env file

const uri = process.env.RABBITMQ_URI;
const controller = new RabbitMQController(uri);

(async () => {
  try {
    const exchange = process.env.EXCHANGE;
    const routingKey = process.env.ROUTING_KEY_FUNCTION;
    const queue = 'queue-function';

    await controller.connect();
    console.log('Connected to RabbitMQ - Function Consumer');

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

        //Chama função que processa a mensagem e retorna o resultado
        const result = calculateFunction(message.content.toString());
        
        //Cria objeto de resposta  
        const replyMessage = generateReply('function', message.content.toString(), result.toString());

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


