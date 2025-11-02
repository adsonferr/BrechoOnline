#  Brechó Online

Projeto de e-commerce para brechó desenvolvido com Flask, SQLite e JavaScript.

## 📋 Requisitos Necessários

Para rodar este projeto, você precisa ter instalado:

1. **Python 3.7 ou superior**
   - Download: https://www.python.org/downloads/
   - ⚠️ **IMPORTANTE**: Ao instalar, marque a opção "Add Python to PATH"

2. **Git** (opcional, mas recomendado)
   - Download: https://git-scm.com/downloads

##  Como Rodar o Projeto (Passo a Passo)

### **Windows**

#### **Opção 1: Usando PowerShell ou CMD**

1. **Abra o PowerShell ou CMD**
   - Pressione `Win + R`, digite `powershell` ou `cmd` e pressione Enter
   - Ou clique com botão direito em "Iniciar" e escolha "Windows PowerShell" ou "Prompt de Comando"

2. **Navegue até a pasta do projeto**
   ```powershell
   cd "C:\caminho\para\o\projeto\BrechoOnline"
   ```
   *Substitua pelo caminho real onde você salvou o projeto*

3. **Verifique se o Python está instalado**
   ```powershell
   python --version
   ```
   - Se aparecer `Python 3.x.x`, está tudo certo!
   - Se aparecer erro, o Python não está instalado ou não está no PATH

4. **Instale as dependências do projeto**
   ```powershell
   pip install -r requirements.txt
   ```
   - Aguarde a instalação terminar (pode levar alguns minutos)

5. **Inicie o servidor**
   ```powershell
   python main.py
   ```

6. **Aguarde a mensagem de sucesso**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:5000 (Press CTRL+C to quit)
   ```

7. **Abra o navegador e acesse**
   - Digite na barra de endereços: `http://127.0.0.1:5000`
   - Ou: `http://localhost:5000`

---

##  Problemas Comuns e Soluções

### **Erro: "python não é reconhecido como comando"**

**Solução:**
- Reinstale o Python marcando a opção "Add Python to PATH"
- Ou use `py` ao invés de `python` no Windows:
  ```powershell
  py main.py
  ```

### **Erro: "pip não é reconhecido"**

**Solução:**
- Instale o pip separadamente:
  ```powershell
  python -m ensurepip --upgrade
  ```
- Ou use `python -m pip`:
  ```powershell
  python -m pip install -r requirements.txt
  ```

### **Erro: "Porta 5000 já está em uso"**

**Solução:**
- Feche outras janelas do terminal que possam estar rodando o servidor
- Ou pare o processo Python que está usando a porta:
  ```powershell
  # Windows PowerShell
  Get-Process python | Stop-Process -Force
  ```

### **Erro ao instalar dependências**

**Solução:**
- Certifique-se de que está conectado à internet
- Tente atualizar o pip primeiro:
  ```powershell
  python -m pip install --upgrade pip
  ```
- Depois instale as dependências novamente:
  ```powershell
  pip install -r requirements.txt
  ```

---

## O Que Este Projeto Instala Automaticamente

Quando você executa `pip install -r requirements.txt`, os seguintes pacotes são instalados:

- **flask** - Framework web
- **aiosqlite** - Banco de dados SQLite assíncrono
- **uvicorn** - Servidor web
- **werkzeug** - Utilitários do Flask
- **asgiref** - Adaptador ASGI

---

## Primeiro Uso

1. **Primeira vez rodando?**
   - O banco de dados será criado automaticamente quando você iniciar o servidor
   - Execute o script para adicionar produtos de exemplo:
     ```powershell
     python inserir_produtos.py
     ```

2. **Criar uma conta:**
   - Acesse `http://127.0.0.1:5000`
   - Clique em "Registra-se"
   - Preencha seus dados

3. **Começar a usar:**
   - Faça login
   - Navegue pelos produtos
   - Adicione itens ao carrinho
   - Finalize sua compra

---

##  Como Parar o Servidor

- No terminal onde o servidor está rodando, pressione:
  ```
  Ctrl + C
  ```

---

##  Autores

- [Lucas Mendes](https://github.com/Luke074)
- [Adson Ferreira](https://github.com/adsonferr)
- [Helena Oliveira](https://github.com/HelenaOliveira366)
- [Marcos](https://github.com/Masterpharao1911)

---

##  Dicas

- Mantenha o terminal aberto enquanto usa o site
- Se mudar algo no código, pare o servidor (Ctrl+C) e inicie novamente
- O banco de dados (`database.db`) é criado automaticamente na primeira execução

---

##  Ainda com Problemas?

Se mesmo seguindo este guia você não conseguir rodar o projeto:

1. Verifique se o Python está instalado: `python --version`
2. Verifique se está na pasta correta do projeto
3. Certifique-se de que instalou todas as dependências: `pip install -r requirements.txt`
4. Verifique se a porta 5000 não está sendo usada por outro programa
5. Leia as mensagens de erro no terminal - elas geralmente indicam o problema

---

**Boa sorte! **
