export default function calculateFunction(messageContent: string) {
  let result = 0;

  if (messageContent.includes('+')) {
    const [firstValue, secondValue] = messageContent.split('+');
    result = parseInt(firstValue) + parseInt(secondValue);
  } else if (messageContent.includes('*')) {
    const [firstValue, secondValue] = messageContent.split('*');
    result = parseInt(firstValue) * parseInt(secondValue);
  } else if (messageContent.includes('/')) {
    const [firstValue, secondValue] = messageContent.split('/');
    result = parseInt(firstValue) / parseInt(secondValue);
  } else if (messageContent.includes('-')) {
    const [firstValue, secondValue] = messageContent.split('-');
    result = parseInt(firstValue) - parseInt(secondValue);
  }

  console.log(`Resultado da Operação: ${result}`);

  return result;
}
