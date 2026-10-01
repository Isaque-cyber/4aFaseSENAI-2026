import { useState } from "react";
import { create } from "../services/user";

const FormUser = () => {

  const [form, setForm] = useState({
    nome: "",
    idade: "",
    email: "",
    cpf: "",
    logradouro: "",
    bairro: "",
    estado: "",
    numero: ""
  });

  const [erros, setErros] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const validarFormulario = () => {

    const novosErros = {};

    // Nome
    if (!form.nome || form.nome.trim().length < 3) {
      novosErros.nome = "Nome deve possuir pelo menos 3 caracteres";
    }

    // Idade
    /* if (
      !form.idade ||
      Number(form.idade) < 0 ||
      Number(form.idade) > 120
    ) {
      novosErros.idade = "Idade inválida";
    } */

    // E-mail
    if (!form.email || !form.email.includes("@")) {
      novosErros.email = "E-mail inválido";
    }

    // CPF
    if (!form.cpf) {
      novosErros.cpf = "CPF é obrigatório";
    }

    // Logradouro
    if (!form.logradouro || form.logradouro.trim().length < 3) {
      novosErros.logradouro = "Logradouro inválido";
    }

    // Bairro
    if (!form.bairro || form.bairro.trim().length < 2) {
      novosErros.bairro = "Bairro inválido";
    }

    // Estado
    if (!form.estado) {
      novosErros.estado = "Selecione um estado";
    }

    // Número
    if (!form.numero || Number(form.numero) <= 0) {
      novosErros.numero = "Número inválido";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        try {

            const resultado = await create(form);
            console.log("Resultado >> ", resultado);

        } catch (error) {
            console.error("Erro: ", error);
        }
    };

  return (
    <div>

      <h1>Cadastro de Usuário</h1>

      <form onSubmit={handleSubmit}>

        {/* NOME */}
        <div>
          <label>Nome</label>

          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Digite seu nome"
          />

          {erros.nome && (
            <p style={{color: "#f00"}}>{erros.nome}</p>
          )}
        </div>


        {/* IDADE */}
        <div>
          <label>Idade</label>

          <input
            type="number"
            name="idade"
            value={form.idade}
            onChange={handleChange}
            min="0"
            max="120"
          />

          {erros.idade && (
            <p style={{color: "#f00"}}>{erros.idade}</p>
          )}
        </div>


        {/* EMAIL */}
        <div>
          <label>E-mail</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
          />

          {erros.email && (
            <p style={{color: "#f00"}}>{erros.email}</p>
          )}
        </div>


        {/* CPF */}
        <div>
          <label>CPF</label>

          <input
            type="text"
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            maxLength="14"
          />

          {erros.cpf && (
            <p style={{color: "#f00"}}>{erros.cpf}</p>
          )}
        </div>


        {/* LOGRADOURO */}
        <div>
          <label>Logradouro</label>

          <input
            type="text"
            name="logradouro"
            value={form.logradouro}
            onChange={handleChange}
            placeholder="Rua, Avenida..."
          />

          {erros.logradouro && (
            <p style={{color: "#f00"}}>{erros.logradouro}</p>
          )}
        </div>


        {/* BAIRRO */}
        <div>
          <label>Bairro</label>

          <input
            type="text"
            name="bairro"
            value={form.bairro}
            onChange={handleChange}
            placeholder="Digite o bairro"
          />

          {erros.bairro && (
            <p style={{color: "#f00"}}>{erros.bairro}</p>
          )}
        </div>


        {/* ESTADO */}
        <div>
          <label>Estado</label>

          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option value="SC">Santa Catarina</option>
            <option value="PR">Paraná</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
          </select>

          {erros.estado && (
            <p style={{color: "#f00"}}>{erros.estado}</p>
          )}
        </div>


        {/* NÚMERO */}
        <div>
          <label>Número</label>

          <input
            type="number"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            min="1"
          />

          {erros.numero && (
            <p style={{color: "#f00"}}>{erros.numero}</p>
          )}
        </div>


        <button type="submit">
          Cadastrar
        </button>

      </form>

    </div>
  );
};

export default FormUser;