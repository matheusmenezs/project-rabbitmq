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
  } else {
    result = undefined; // Caso não seja uma operação válida
  }

  result == undefined
    ? console.log('Invalid Operation')
    : console.log(`Operation Result: ${result}`);

  return result;
}
