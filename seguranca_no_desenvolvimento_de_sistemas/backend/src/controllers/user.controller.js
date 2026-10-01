import db from "../config/database.js";

export const createUser = async (req, res) => {
    const {nome, idade, email, cpf, logradouro, bairro, estado, numero} = req.body;

    // =========================
    // VALIDAÇÃO
    // =========================

    //validando se realmente é uma string, se é obrigatorio e se é maior que 3 no tamanho
    if (!nome || typeof nome !== "string" || nome.trim().length < 3) {
        return res.status(400).json({
            erro: "Nome inválido"
        });
    }

    //validando realmente se é numero e se a idade é maior q 1
    if (!Number.isInteger(idade) || idade < 0 || idade > 120) {
        return res.status(400).json({
            erro: "Idade inválida"
        });
    }

    const estadosPermitidos = [
        "SC", "PR", "RS", "SP", "RJ"
    ];

   if (
        typeof estado !== "string" ||
        !estadosPermitidos.includes(estado)
    ) {
        return res.status(400).json({
            erro: "Estado inválido"
        });
    }

    if(!email || typeof email !== "string" || !email.includes("@") || email.length > 150) {
        return res.status(400).json({
            erro: "E-mail inválido"
        });
    }

    if(!cpf || typeof cpf !== "string"){
        return res.status(400).json({
            erro: "CPF inválido"
        });
    }

    // =========================
    // SANITIZAÇÃO
    // =========================

    if (!validarCPF(cpf)) {
        return res.status(400).json({
            erro: "CPF inválido"
        });
    }

    // Remove pontos e hífen
    const cpfLimpo = cpf.replace(/\D/g, "");

    const nomeSanitizado = nome
    .trim()
    .replace(/\s+/g, " ");

    
    // Número
    if (
        !Number.isInteger(numero) ||
        numero <= 0
    ) {
        return res.status(400).json({
            erro: "Número inválido"
        });
    }

    // Logradouro
    if (
        !logradouro ||
        typeof logradouro !== "string" ||
        logradouro.trim().length < 3 ||
        logradouro.length > 150
    ) {
        return res.status(400).json({
            erro: "Logradouro inválido"
        });
    }


    // Bairro
    if (
        !bairro ||
        typeof bairro !== "string" ||
        bairro.trim().length < 2 ||
        bairro.length > 100
    ) {
        return res.status(400).json({
            erro: "Bairro inválido"
        });
    }

    // =========================
    // PARAMETRIZAÇÃO
    // =========================

    try {

        const sql = `
            INSERT INTO usuarios
            (
                nome,
                idade,
                email,
                cpf,
                logradouro,
                bairro,
                estado,
                numero
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            nomeSanitizado,
            idade,
            email.trim().toLowerCase(),
            cpfLimpo,
            logradouro.trim(),
            bairro.trim(),
            estado,
            numero
        ];

        const [resultado] = await db.execute(
            sql,
            valores
        );


        return res.status(201).json({
            mensagem: "Usuário criado com sucesso",
            id: resultado.insertId
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            erro: "Erro ao cadastrar usuário"
        });
    }

}

function validarCPF(cpf) {

    // Remove pontos, hífen e qualquer caractere que não seja número
    cpf = cpf.replace(/\D/g, "");

    // CPF precisa ter exatamente 11 dígitos
    if (cpf.length !== 11) {
        return false;
    }

    // Rejeita CPFs com todos os números iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // =========================
    // PRIMEIRO DÍGITO
    // =========================

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = soma % 11;

    let primeiroDigito = resto < 2 ? 0 : 11 - resto;

    if (primeiroDigito !== Number(cpf[9])) {
        return false;
    }

    // =========================
    // SEGUNDO DÍGITO
    // =========================

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = soma % 11;

    let segundoDigito = resto < 2 ? 0 : 11 - resto;

    if (segundoDigito !== Number(cpf[10])) {
        return false;
    }

    return true;
}