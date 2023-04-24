import amqp from 'amqplib';
import { IRabbitMQ } from './IRabbit';

//Classe responsável por gerenciar a conexão com o RabbitMQ
class RabbitMQController implements IRabbitMQ {
  private uri: string;
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(uri: string) {
    this.uri = uri;
  }

  //Estabelece conexão com o RabbitMQ
  async connect() {
    this.connection = await amqp.connect(this.uri);
    this.channel = await this.connection.createChannel();
  }

  /**
   * Cria uma fila e retorna o nome da fila
   * @param {string} queue Nome da fila a ser criada
   * @param {amqp.Options.AssertQueue} options Opções da fila
   * @returns {string} Nome da fila criada
   */
  async assertQueue(
    queue: string,
    options: amqp.Options.AssertQueue
  ): Promise<string> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }
    const reply = await this.channel.assertQueue(queue, options);

    return reply.queue;
  }

  /**
   * Envia uma mensagem diretamente para uma fila
   * @param {string} queue Nome da fila que receberá a mensagem
   * @param {string} message Mensagem a ser enviada
   * @param {amqp.Options.Publish} options Opções de publicação da mensagem
   * @returns {void} Não retorna nada
   */
  async sendToQueue(
    queue: string,
    message: string,
    options: amqp.Options.Publish
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }
    try {
      this.channel.sendToQueue(queue, Buffer.from(message), options);
    } catch (error) {
      throw new Error('Erro ao enviar mensagem para a fila');
    }
  }

  /**
   * Consome mensagem de uma fila
   * @param {string} queue Nome da fila em que a mensagem será consumida
   * @returns {void} Não retorna nada
   */
  async consumeFromQueue(queue: string): Promise<void> {
    try {
      this.channel.consume(queue, (callback) => {
        console.log(callback.content.toString());
      });
    } catch (error) {
      throw new Error('Erro ao consumir mensagem da fila');
    }
  }

  /**
   * Envia mensagem para um exchange
   * @param {string} exchange Nome do exchange que receberá a mensagem
   * @param {string} routingKey Routing key que será utilizada para enviar a mensagem
   * @param {string} message Mensagem a ser enviada
   * @param {amqp.Options.Publish} options Opções de publicação da mensagem, exemplo replyTo
   * @returns {void} Não retorna nada
   */
  async sendToExchange(
    exchange: string,
    routingKey: string,
    message: string,
    options: amqp.Options.Publish = {}
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }
    try {
      //Cria um exchange do tipo topic (se não existir)
      await this.channel.assertExchange(exchange, 'topic');

      //Envia a mensagem para o exchange com a routingKey especificada
      this.channel.publish(exchange, routingKey, Buffer.from(message), options);
    } catch (error) {
      throw new Error('Erro ao enviar mensagem para o exchange');
    }
  }

  /**
   * Consome mensagem de um exchange
   * @param {string} queue Nome da fila que receberá a mensagem (se vazia, cria uma fila exclusiva)
   * @param {string} exchange Nome do exchange que receberá a mensagem
   * @param {string} routingKey Routing key que será utilizada para consumir a mensagem
   * @param {amqp.ConsumeMessage} callback Função que será executada quando a mensagem for consumida
   * @param {amqp.Options.Consume} options Opções de consumo da mensagem, exemplo noAck
   * @returns {void} Não retorna nada
   */
  async consumeFromExchange(
    queue: string,
    exchange: string,
    routingKey: string,
    callback: (msg: amqp.ConsumeMessage) => void,
    options: amqp.Options.Consume = {}
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }
    try {
      //Cria um exchange do tipo topic e cria uma fila
      await this.channel.assertExchange(exchange, 'topic');

      //Cria uma fila exclusiva ou não, dependende do parâmetro queue
      let reply: amqp.Replies.AssertQueue;
      queue.length > 0
        ? (reply = await this.channel.assertQueue(queue))
        : (reply = await this.channel.assertQueue('', { exclusive: true }));

      //Associa a fila ao exchange com a routingKey especificada e consome a mensagem
      this.channel.bindQueue(reply.queue, exchange, routingKey);
      this.channel.consume(reply.queue, callback, options);
    } catch (error) {
      throw new Error('Erro ao consumir mensagem do exchange');
    }
  }

  /**
   * Confirma o recebimento de uma mensagem
   * @param msg Mensagem a ser confirmada
   * @returns {void} Não retorna nada
   * */
  async ack(msg: amqp.ConsumeMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }
    this.channel.ack(msg);
  }

  /**
   * Rejeita uma mensagem
   * @param msg  Mensagem a ser rejeitada
   * @returns {void} Não retorna nada
   */
  async nack(msg: amqp.ConsumeMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }
    this.channel.nack(msg);
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  }
}
export default RabbitMQController;
