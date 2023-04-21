# RabbitMQ

* Existe um produtor e três diferentes consumidores que executam tarefas diferentes (processa mensagem, realiza uma operação e salva mensagem em um arquivo)
* Um produtor publica a mensagem em uma exchange previamente definida (.env)
* Ao publicar na exchange o produtor define para qual routing key a mensagem será entregue
* Cada consumidor estabelece uma relação com a exchange (routing key) e nessa relação é feito o bind com a fila específica de cada consumidor
* Quando o consumidor for consumir as mensagens ele buscara apenas aquelas condizentes a sua routingkey.

Informações básicas:

* A instância do rabbitmq pode ser criada executando o docker-compose ou apenas criando um cluster pelo CloudAMQP.
* Crie uma instância pelo seguinte link <https://customer.cloudamqp.com/signup> gratuitamente

* Caso opte por rodar o rabbitmq localmente execute o seguinte comando: `docker-compose up -d`

Producer execute:
  npm run start:producer [routingKey] [message]

Consumers execute:

* `npm run start:message`
* `npm run start:function`
* `npm run start:file`

Routing Keys previamente definidas:*

* `message.#`
* `*.function.*`
* `*.*.file`

Exemplo de uso das Routing Keys:

* message. = envia apenas para message
* message.function.teste = envia para message e para function
* message.function.file = envia para todos
* qqrcoisa.qqrcoisa.file = envia apenas para file
