import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "path";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Sert les fichiers visuels du site (Frontend de la boutique)
const clientDist = path.join(process.cwd(), "artifacts/lingerie-shop/dist/public");
app.use(express.static(clientDist));

// Redirige la navigation vers l'accueil du site
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

export default app;
