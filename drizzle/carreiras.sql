-- ============================================================================
-- Meteoro 24 — Carreiras (tabelas + vagas iniciais + textos da página)
--
-- Colar no phpMyAdmin, separador SQL, com a base do site seleccionada.
-- Só acrescenta o que é novo; pode correr-se mais do que uma vez.
-- ============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `applications` (
	`id` char(36) NOT NULL,
	`job_id` char(36),
	`job_title` varchar(200) NOT NULL DEFAULT '',
	`name` varchar(160) NOT NULL,
	`email` varchar(200) NOT NULL,
	`phone` varchar(60) NOT NULL DEFAULT '',
	`message` text NOT NULL DEFAULT (''),
	`cv_path` varchar(300) NOT NULL DEFAULT '',
	`cv_filename` varchar(300) NOT NULL DEFAULT '',
	`locale` varchar(5) NOT NULL DEFAULT 'pt',
	`status` varchar(20) NOT NULL DEFAULT 'nova',
	`notes` text NOT NULL DEFAULT (''),
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `job_translations` (
	`job_id` char(36) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(200) NOT NULL,
	`department` varchar(160) NOT NULL DEFAULT '',
	`type` varchar(80) NOT NULL DEFAULT '',
	`location` varchar(160) NOT NULL DEFAULT '',
	`intro` text NOT NULL,
	`sections` json NOT NULL,
	`profile` text NOT NULL DEFAULT (''),
	CONSTRAINT `job_translations_job_id_locale_pk` PRIMARY KEY(`job_id`,`locale`)
);

CREATE TABLE IF NOT EXISTS `jobs` (
	`id` char(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_slug_unique` UNIQUE(`slug`)
);

CREATE INDEX `applications_created_idx` ON `applications` (`created_at`);

INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'careers', '{"hero":{"eyebrow":"Estamos a recrutar","title":"Construa connosco o que fica de pé.","lead":"A Meteoro 24 cresce com quem leva a construção a sério. Procuramos pessoas rigorosas, organizadas e com vontade de fazer bem à primeira."},"why":{"title":"Porquê a Meteoro 24?","items":[{"title":"Trabalho com método","text":"Aqui planeia-se antes de executar. O rigor não é slogan — é a forma como trabalhamos todos os dias."},{"title":"Obra de ponta a ponta","text":"Da orçamentação à entrega, acompanha o projecto inteiro. Aprende-se muito quando se vê a obra toda."},{"title":"Crescimento real","text":"Estamos em expansão. Há espaço para crescer com a empresa e assumir mais responsabilidade."},{"title":"Responsabilidade a sério","text":"Damos autonomia a quem a merece e respondemos pelo que entregamos. Procuramos o mesmo em cada pessoa."}]},"jobs":{"title":"Vagas em aberto","lead":"As posições que estamos a preencher agora. Não encontra a sua? Envie uma candidatura espontânea.","profileLabel":"Perfil","empty":"De momento não há vagas em aberto. Pode enviar uma candidatura espontânea — guardamos o seu CV para quando surgir a oportunidade certa.","apply":"Candidatar-me","details":"Ver detalhes","share":"Partilhar"},"spontaneous":{"title":"Candidatura espontânea","text":"Não há uma vaga que encaixe consigo? Envie o seu CV na mesma. Quando abrir uma posição adequada, é dos primeiros a saber.","label":"Candidatura espontânea"},"form":{"title":"Formulário de candidatura","lead":"Preencha os dados e anexe o seu CV. Respondemos a todas as candidaturas.","name":"Nome completo","email":"Email","phone":"Telefone","position":"Vaga","spontaneousOption":"Candidatura espontânea","message":"Mensagem","messageHint":"Diga-nos porque quer trabalhar connosco (opcional).","cv":"Currículo (CV)","cvHint":"PDF, DOC ou DOCX, até 5 MB.","submit":"Enviar candidatura","sending":"A enviar...","success":"Candidatura recebida. Obrigado — entraremos em contacto.","error":"Não foi possível enviar a candidatura. Tente novamente ou escreva-nos directamente.","required":"Campo obrigatório","invalidEmail":"Introduza um email válido","cvRequired":"Anexe o seu CV.","privacy":"Os dados e o CV enviados são usados apenas para avaliar a sua candidatura."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'careers', '{"hero":{"eyebrow":"We are hiring","title":"Build with us what stands.","lead":"Meteoro 24 grows with people who take construction seriously. We look for rigorous, organised people who want to get it right the first time."},"why":{"title":"Why Meteoro 24?","items":[{"title":"Work with method","text":"Here we plan before we build. Rigour is not a slogan — it is how we work every day."},{"title":"The whole build","text":"From estimating to handover, you follow the entire project. You learn a lot when you see the whole thing."},{"title":"Real growth","text":"We are expanding. There is room to grow with the company and take on more responsibility."},{"title":"Real accountability","text":"We give autonomy to those who earn it and stand behind what we deliver. We look for the same in every person."}]},"jobs":{"title":"Open positions","lead":"The roles we are filling right now. Not seeing yours? Send a spontaneous application.","profileLabel":"Profile","empty":"There are no open positions at the moment. You can still send a spontaneous application — we keep your CV for when the right role comes up.","apply":"Apply","details":"View details","share":"Share"},"spontaneous":{"title":"Spontaneous application","text":"No role that fits you? Send your CV anyway. When a suitable position opens, you will be among the first to know.","label":"Spontaneous application"},"form":{"title":"Application form","lead":"Fill in the fields and attach your CV. We respond to every application.","name":"Full name","email":"Email","phone":"Phone","position":"Position","spontaneousOption":"Spontaneous application","message":"Message","messageHint":"Tell us why you want to work with us (optional).","cv":"Résumé (CV)","cvHint":"PDF, DOC or DOCX, up to 5 MB.","submit":"Send application","sending":"Sending...","success":"Application received. Thank you — we will be in touch.","error":"The application could not be sent. Please try again or write to us directly.","required":"Required field","invalidEmail":"Enter a valid email address","cvRequired":"Attach your CV.","privacy":"The data and CV you send are used only to assess your application."}}');
INSERT IGNORE INTO `jobs` (`id`, `slug`, `position`, `published`) VALUES ('ae5e5e12-eff8-4dc0-8060-4886043f46cf', 'engenheiro-civil-direccao-de-obra', 0, 1);
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('ae5e5e12-eff8-4dc0-8060-4886043f46cf', 'pt', 'Engenheiro(a) Civil — Direcção de Obra', 'Produção & Obra', 'Tempo inteiro', 'Luanda, Angola', 'A Meteoro 24 procura um(a) Engenheiro(a) Civil para dirigir obra no terreno, coordenar as frentes e garantir que o que foi planeado é o que se executa.', '[{"title":"O que irá fazer","items":["Coordenar as frentes de trabalho e as equipas em obra","Controlar prazos, custos e qualidade contra o plano de execução","Acompanhar medições, autos e mapas de quantidades","Fazer a ligação entre projecto, fornecedores e fiscalização","Reportar o avanço e antecipar desvios"]},{"title":"Requisitos","items":["Licenciatura em Engenharia Civil","Mínimo de 3 anos de experiência em direcção ou acompanhamento de obra","Domínio de leitura de projecto e de cronogramas","Conhecimento de AutoCAD e de folha de cálculo","Carta de condução"]},{"title":"Valorizamos","items":["Experiência em estruturas metálicas","Inglês técnico","MS Project ou equivalente"]}]', 'Rigor, liderança de equipas, organização e capacidade de decidir no terreno.');
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('ae5e5e12-eff8-4dc0-8060-4886043f46cf', 'en', 'Civil Engineer — Site Management', 'Production & Site', 'Full-time', 'Luanda, Angola', 'Meteoro 24 is looking for a Civil Engineer to run works on site, coordinate the work fronts and make sure what was planned is what gets built.', '[{"title":"What you will do","items":["Coordinate work fronts and site teams","Control schedule, cost and quality against the execution plan","Follow measurements, progress records and bills of quantities","Bridge design, suppliers and supervision","Report progress and anticipate deviations"]},{"title":"Requirements","items":["Degree in Civil Engineering","Minimum 3 years of site management or supervision experience","Fluent reading of drawings and programmes","Command of AutoCAD and spreadsheets","Driver\'s licence"]},{"title":"Nice to have","items":["Experience with steel structures","Technical English","MS Project or equivalent"]}]', 'Rigour, team leadership, organisation and the ability to decide on site.');
INSERT IGNORE INTO `jobs` (`id`, `slug`, `position`, `published`) VALUES ('c89d861a-5781-45ae-a89c-741019a1fa64', 'tecnico-de-orcamentacao-e-medicoes', 1, 1);
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('c89d861a-5781-45ae-a89c-741019a1fa64', 'pt', 'Técnico(a) de Orçamentação e Medições', 'Estudos & Orçamentação', 'Tempo inteiro', 'Luanda, Angola', 'Procuramos um(a) técnico(a) meticuloso(a) para medir, orçamentar e preparar mapas de quantidades que tornem o investimento transparente antes de a obra começar.', '[{"title":"O que irá fazer","items":["Fazer medições e levantamentos a partir de projecto","Elaborar mapas de quantidades e estimativas de custo","Consultar fornecedores e consolidar preços","Apoiar a preparação de propostas"]},{"title":"Requisitos","items":["Formação em Engenharia Civil, Construção ou área técnica","Experiência em medições e orçamentação","Domínio de Excel e de leitura de projecto","Método e atenção ao detalhe"]},{"title":"Valorizamos","items":["Conhecimento de software de orçamentação","AutoCAD","Inglês funcional"]}]', 'Atenção ao detalhe, método, honestidade nos números.');
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('c89d861a-5781-45ae-a89c-741019a1fa64', 'en', 'Cost Estimating & Quantities Technician', 'Studies & Estimating', 'Full-time', 'Luanda, Angola', 'We are looking for a meticulous technician to measure, estimate and prepare bills of quantities that make the investment transparent before the build starts.', '[{"title":"What you will do","items":["Take measurements and surveys from drawings","Prepare bills of quantities and cost estimates","Consult suppliers and consolidate prices","Support proposal preparation"]},{"title":"Requirements","items":["Training in Civil Engineering, Construction or a technical field","Experience in measurements and estimating","Command of Excel and reading of drawings","Method and attention to detail"]},{"title":"Nice to have","items":["Knowledge of estimating software","AutoCAD","Functional English"]}]', 'Attention to detail, method, honesty with numbers.');
