import amqp from 'amqplib';

export interface IRabbitMQ {
    connect(): Promise<void>;
    assertQueue(queue: string, options: amqp.Options.AssertQueue): Promise<string>;
    sendToQueue(queue: string, message: string, options: amqp.Options.Publish): Promise<void>;
    consumeFromQueue(queue: string): Promise<void>;
    sendToExchange(
        exchange: string,
        routingKey: string,
        message: string,
        options: amqp.Options.Publish
    ): Promise<void>;
    consumeFromExchange(
        queue: string,
        exchange: string,
        routingKey: string,
        callback: (msg: amqp.ConsumeMessage) => void,
        options: amqp.Options.Consume
    ): Promise<void>;
    close(): Promise<void>;
}
