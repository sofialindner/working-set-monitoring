# Sistema de Monitoramento de Working Sets

Backend em **Rust** • Frontend em **Angular 19**

Este projeto implementa um sistema que monitora, em tempo real, o *Working Set* dos processos ativos do Windows. O backend utiliza chamadas nativas do sistema operacional para coletar métricas detalhadas de memória, enquanto o frontend apresenta essas informações em uma interface interativa.

---

## 📦 Requisitos

### Backend (Rust)

* Rust instalado via **rustup**
* Toolchain: `stable-x86_64-pc-windows-msvc`
* Windows 10 ou superior (necessário para APIs nativas)

### Frontend (Angular)

* Node.js (versão LTS)
* npm

---

## 🚀 Executando o Backend

### 1. Instalar o Rust

Instale o Rust pelo rustup:

[https://rust-lang.org/tools/install/](https://rust-lang.org/tools/install/)

### 2. Selecionar a toolchain correta

Este projeto depende de chamadas nativas do Windows, portanto é essencial utilizar a toolchain MSVC:

```sh
rustup default stable-x86_64-pc-windows-msvc
```

Caso ela ainda não esteja instalada:

```sh
rustup toolchain install stable-x86_64-pc-windows-msvc
rustup default stable-x86_64-pc-windows-msvc
```

### 3. Compilar o backend

No diretório do backend:

```sh
cargo build
```

### 4. Executar o servidor

```sh
cargo run
```

O servidor iniciará e disponibilizará as rotas principais:

* `/ws` — WebSocket com os dados em tempo real
* `/clear/{pid}` — Limpa o Working Set do processo
* `/terminate/{pid}` — Encerra o processo

---

## 💻 Executando o Frontend (Angular 19)

### 1. Instalar dependências

No diretório `frontend/`:

```sh
npm install
```

### 2. Rodar o servidor de desenvolvimento

```sh
ng serve
```

A aplicação ficará disponível em:

```
http://localhost:4200
```

O frontend se conectará automaticamente ao backend para exibir os dados atualizados dos processos.

---

## 📂 Estrutura do Projeto

```
/backend
    Cargo.toml
    src/
/frontend
    angular.json
    package.json
    src/
```
