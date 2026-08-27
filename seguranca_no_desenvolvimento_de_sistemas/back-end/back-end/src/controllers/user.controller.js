import bcrypt from "bcrypt";
import db from "../config/database.js";

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

export const createUser = async (req, res) => {
    const { name, email, cpf, senha, logradouro, numero, bairro, estado, cidade } = req.body;

    // VALIDAÇÃO
    if (!name || typeof name !== "string" || name.trim().length < 3) {
        return res.status(400).json({ messagem: "Nome inválido. Este campo é obrigatório.", sucess: false });
    }

    if (!email || typeof email !== "string" || !email.includes("@") || email.trim().length > 150) {
        return res.status(400).json({ messagem: "Email inválido. Este campo é obrigatório.", sucess: false });
    }

    if (!cpf || typeof cpf !== "string") {
        return res.status(400).json({ messagem: "CPF inválido. Este campo é obrigatório.", sucess: false });
    }

    if (!validarCPF(cpf)) {
        return res.status(400).json({ messagem: "CPF inválido. Este campo é obrigatório.", sucess: false });
    }

    if (!senha || senha.length < 8 || senha.length > 32) {
        return res.status(400).json({ messagem: "Senha inválida. Deve ter entre 8 e 32 caracteres.", sucess: false });
    }

    // Sanitização
    const nomeSanitizado = name.trim();
    const cpfLimpo = cpf.replace(/\D/g, "");

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `INSERT INTO usuario (name, email, cpf, senha) VALUES (?, ?, ?, ?)`;
        const values = [nomeSanitizado, email, cpfLimpo, senhaHash];

        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(400).json({ messagem: "Erro ao criar usuário.", sucess: false });
        }

        return res.status(201).json({ messagem: "Usuário criado com sucesso.", sucess: true });
    } catch (err) {
        return res.status(500).json({ messagem: "Erro interno", sucess: false });
    }
};
