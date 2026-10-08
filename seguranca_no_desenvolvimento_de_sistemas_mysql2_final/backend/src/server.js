import app from "./app.js";

const PORT = process.env.PORT || 8081;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 6) {
    throw new Error("Defina JWT_SECRET no backend/.env com pelo menos 6 caracteres.");
}

app.listen(PORT, () => {
    console.log(
        `Servidor rodando na portinha => http://localhost:${PORT}/`
    );
});
