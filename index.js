import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';

operation();

function operation() {
  const inquerer = inquirer;

  inquerer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que você deseja fazer?',
      choices: ['Criar Conta','Consultar Saldo', 'Depositar', 'Sacar', 'Sair']
    }
  ])
  .then((answer) => {

    const action = answer['action'];
    
    if(action === 'Criar Conta') {
      createAccount();
      return;
    }

    if(action === 'Depositar') {
      deposit()
      return;
    }

    if(action === 'Consultar Saldo') {
      getAccountBalance()
      return;
    }
    if(action === 'Sacar') {
      withdraw()
      return;
    }
    if(action === 'Sair') {

      console.log(chalk.bgBlue.black('Obrigado por usar o Accounts'));
      process.exit();
    }

  })
  .catch((err) => console.log(err));
}

// create an account

function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta a seguir'));

  buildACcount();
}

function buildACcount() {
  const inquerer = inquirer;

  inquerer.prompt([
    {
      name: 'accountName',
      message: 'Digite um nome para a sua conta:'
    }
  ])
  .then((answer) => {
    const accountName = answer['accountName']; 
  
    console.info(accountName);

    if(!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }

    if(fs.existsSync(`accounts/${accountName}.json`)) {

      console.log(chalk.bgRed.black('Conta já existente, escolha outro nome!'));
      buildACcount();
      return;
    }

    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err) {
      console.log(err);
    })

    console.log(chalk.green('Parabéns! Sua conta foi criada!'));
    operation();
  })
  .catch((err) => console.log(err));

}

function deposit() {
  const inquerer = inquirer;

  inquerer.prompt([
    {
      name: 'accountName',
      message: 'Qual nome da sua conta?'
    }
  ])
  .then((answer) => {

    const accountName = answer['accountName'];

    if(!checkAccount(accountName)) {
      return deposit();
    }

    inquerer.prompt([
      {
        name: 'amount',
        message: 'Valor:'
      }
    ])
    .then((answer) => {

      const amount = answer['amount'];

      // add amount

      addAmount(accountName, amount);
      operation();
    })
    .catch((err) => console.log(err));


  })
  .catch((err) => console.log(err))
}

function checkAccount(accountName) {

  if(!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Conta Inexistente!'));
    return false;
  }

  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function(err) {
      console.log(err);
    }
  )

  console.log(chalk.green(`Deposito realizado com sucesso no valor de: R$ ${amount}`));
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r'
  })

  return JSON.parse(accountJSON);
}

function getAccountBalance() {
  const inquerer = inquirer;

  inquerer.prompt([
    {
      name: 'accountName',
      message: 'Qual nome da sua conta?'
    }
  ])
  .then((answer) => {
    const accountName = answer['accountName'];

    if(!checkAccount(accountName)) {
      return getAccountBalance();
    }

    const accountData = getAccount(accountName);

    console.log(chalk.bgBlue.black(`Saldo disponível: R$ ${accountData.balance}`));

    operation();

  })
  .catch((err) => console.log(err));
}

function withdraw() {
  const inquerer = inquirer;

  inquerer.prompt([
    {
      name: 'accountName',
      message: 'Qual nome da sua conta?'
    }
  ])
  .then((answer) => {
    const accountName = answer['accountName'];

    if(!checkAccount(accountName)) {
      return withdraw();
    }

    inquerer.prompt([
      {
        name: 'amount',
        message: 'Valor do Saque?'
      }
    ])
    .then((answer) => {

      const amount = answer['amount'];

      removeAmount(accountName ,amount);
    })
    .catch((err) => console.log(err));


  })
  .catch((err) => console.log(err));
}

function removeAmount(accountName ,amount) {
  
  const accountData = getAccount(accountName)

  if(!amount) {
    console.log(chalk.bgRed.black('Error, tente novamente mais tarde!'));
    return withdraw();
  }

  if(accountData.balance < amount) {
    console.log(chalk.bgRed.black('Saldo insuficiente'));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  )

  console.log(chalk.green(`Saque de ${amount} realizado com sucesso`));
  operation();
}