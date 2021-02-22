const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.add("active")
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove("active");
    }
}

//Amarzena na memoria do navegador (local Storage)
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finance:transactions")) || [];
    },
    set(transactions){
        localStorage.setItem("dev.finance:transactions", JSON.stringify(transactions));
    },
}

//Funcções principais
const Transaction = {
    //Armazena valores
    all: Storage.get(),

    add(transaction){
         Transaction.all.push(transaction);
         App.reload();
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload();
    },

    //Estradas
    incomes() {
            let income = 0; // inicia a variável em 0
            //pega todas as transações
            //para cada transação
            Transaction.all.forEach(transaction => {
            //se ela for > 0
            if(transaction.amount > 0){
            //soma a uma variável e retorna a variável
            income = income + transaction.amount;
            }
        });
        
        return income;
    },

    expenses() {
        let expense = 0; // inicia a variável em 0
            //pega todas as transações
            //para cada transação
            Transaction.all.forEach(transaction => {
            //se ela for < 0
            if(transaction.amount < 0){
            //soma a uma variável e retorna a variável
            expense = expense + transaction.amount;
            }
        });
        
        return expense;
    },

    total() {
        //Entradas - Saídas
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Pegando dados do html
const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index){ // cria uma tr no html
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);

        tr.dataset.index = index;
        
        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) { // add os dados dentro da tr
        const CSSclass = transaction.amount > 0 ? "income" : "expense"; //verifica se é uma receita ou despesa

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="close-icon" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `;

        return html //retorna-se a constante para poder ser usada externamente
    },
    updateBalance(){
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById("totaalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
}

//Formatação de valor
const Utils = {
    formatAmount(value){
        value = Number(value) * 100;
        return value;
    },

    formatDate(date){
        const splitDate = date.split("-");
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
    },

    formatCurrency(value){
      const signal = Number(value) < 0 ? "-" : ""; // verifica de é positivo ou negativo

      value = String(value).replace(/\D/g, ""); //transforma numa String e retira tudo que não for numero

      value = Number(value) / 100; //transforma novamente em número e divide por 100 para formartar as casas decimais corretas

      value = value.toLocaleString("pt-BR", { //formata para o valor correto usado em um determinado país ou região
          style: "currency",
          currency: "BRL"
      })

      return(signal + value) // retorna o valor para ser usado externamente
    }
}

//Obtendo valores do formulario
const Form = {
    description: document.querySelector("#description"),
    amount: document.querySelector("#amount"),
    date: document.querySelector("#date"),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    formatData(){

    },
    validateFields(){
      const { description, amount, date} = Form.getValues();
            if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
                throw new Error("Por favor, preencha todos os campor");
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return{
            description,
            amount,
            date,
        }
    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },


    submit(event){
        event.preventDefault();

        //verificar se todas as informações foram preenchidas
        try {
            Form.validateFields();
            //formatar os dados para salvas
            const transaction = Form.formatValues();
            //salvar
            Transaction.add(transaction);
            //apagar os dados do formulário
            Form.clearFields();
            //fechar modal
            Modal.close();
            //atualizar a aplicação
            // App.reload(); (ja add. Está aqui so para lembrar)

        } catch (error) {
            alert(error.message);
        }


       
    }
}

//Execultanto aplicado
const App = {
   init(){
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
       
   },
   reload(){
       DOM.clearTransactions();
       App.init();
   },
}

App.init();





