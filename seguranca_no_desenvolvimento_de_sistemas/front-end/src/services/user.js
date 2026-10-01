import api from "./api";

export const create = async (form) => {

    try {

        const response = await api.post("/create", form);

        console.log("Usuário criado:", response.data);

        return response.data;

    } catch (error) {

        if (error.response) {

            console.error(
                "Erro do backend:",
                error.response.data.erro
            );

        } else if (error.request) {

            console.error(
                "Backend não respondeu:",
                error.message
            );

        } else {

            console.error(
                "Erro ao configurar requisição:",
                error.message
            );
        }

        throw error;
    }
};