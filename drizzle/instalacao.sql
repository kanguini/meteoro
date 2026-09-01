-- ============================================================================
-- Meteoro 24 — instalação da base de dados
--
-- Colar no phpMyAdmin, separador SQL, com a base do site seleccionada.
-- Pode correr-se mais do que uma vez: não apaga nem duplica nada.
-- Gerado por `npm run db:sql` a partir do conteúdo actual do site.
-- ============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `media` (
	`id` char(36) NOT NULL,
	`url` varchar(400) NOT NULL,
	`storage_path` varchar(300) NOT NULL,
	`filename` varchar(300) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`bytes` int NOT NULL,
	`width` int,
	`height` int,
	`uploaded_by` char(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `messages` (
	`id` char(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(200) NOT NULL,
	`phone` varchar(60) NOT NULL DEFAULT '',
	`subject` varchar(200) NOT NULL DEFAULT '',
	`body` text NOT NULL,
	`locale` varchar(5) NOT NULL DEFAULT 'pt',
	`read_at` timestamp,
	`archived_at` timestamp,
	`emailed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `page_content` (
	`locale` varchar(5) NOT NULL,
	`page` varchar(32) NOT NULL,
	`data` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_content_locale_page_pk` PRIMARY KEY(`locale`,`page`)
);

CREATE TABLE IF NOT EXISTS `project_translations` (
	`project_id` char(36) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(200) NOT NULL,
	`summary` text NOT NULL,
	`body` json NOT NULL,
	CONSTRAINT `project_translations_project_id_locale_pk` PRIMARY KEY(`project_id`,`locale`)
);

CREATE TABLE IF NOT EXISTS `projects` (
	`id` char(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`year` varchar(16) NOT NULL DEFAULT '',
	`client` varchar(200) NOT NULL DEFAULT '',
	`location` varchar(200) NOT NULL DEFAULT '',
	`cover_image` varchar(400),
	`gallery` json NOT NULL,
	`service_slugs` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE IF NOT EXISTS `service_translations` (
	`service_id` char(36) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(200) NOT NULL,
	`short` text NOT NULL,
	`lead` text NOT NULL,
	`body` json NOT NULL,
	`points` json NOT NULL,
	`keywords` json NOT NULL,
	CONSTRAINT `service_translations_service_id_locale_pk` PRIMARY KEY(`service_id`,`locale`)
);

CREATE TABLE IF NOT EXISTS `services` (
	`id` char(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`number` varchar(8) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`image` varchar(400),
	`image_alt_pt` text NOT NULL,
	`image_alt_en` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE IF NOT EXISTS `sessions` (
	`token_hash` char(64) NOT NULL,
	`user_id` char(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_token_hash` PRIMARY KEY(`token_hash`)
);

CREATE TABLE IF NOT EXISTS `settings` (
	`id` varchar(16) NOT NULL,
	`phone` varchar(60) NOT NULL,
	`email` varchar(200) NOT NULL,
	`address_street` varchar(240) NOT NULL,
	`address_city` varchar(120) NOT NULL,
	`slogan` varchar(200) NOT NULL,
	`hours_pt` varchar(160) NOT NULL,
	`hours_en` varchar(160) NOT NULL,
	`linkedin` varchar(300) NOT NULL DEFAULT '',
	`instagram` varchar(300) NOT NULL DEFAULT '',
	`facebook` varchar(300) NOT NULL DEFAULT '',
	`cover_image` varchar(400) NOT NULL,
	`cover_alt_pt` text NOT NULL,
	`cover_alt_en` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `users` (
	`id` char(36) NOT NULL,
	`email` varchar(200) NOT NULL,
	`name` varchar(160) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(16) NOT NULL DEFAULT 'editor',
	`active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

CREATE INDEX `messages_created_idx` ON `messages` (`created_at`);

CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'settings' AND COLUMN_NAME = 'cover_poster');
SET @ddl := IF(@col = 0, 'ALTER TABLE `settings` ADD `cover_poster` varchar(400) DEFAULT \'\' NOT NULL', 'DO 0');
PREPARE alterStatement FROM @ddl;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

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

-- ============================================================================
-- Meteoro 24 — actualizar o corpo dos serviços (texto mais enxuto)
-- Colar no phpMyAdmin. Actualiza só a coluna body, por slug e idioma.
-- ============================================================================

SET NAMES utf8mb4;

UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["Estruturamos a obra antes de ela começar e mantemos esse plano vivo enquanto decorre. O objectivo não é produzir um cronograma bonito, mas ter, a qualquer momento, uma resposta fundamentada para \\"onde estamos\\" e \\"o que acontece a seguir\\"."]' WHERE s.slug = 'planeamento-e-controlo-de-obras' AND st.locale = 'pt';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["Um orçamento serve para decidir, não apenas para aprovar. Por isso trabalhamos a partir de quantidades medidas e de pressupostos explícitos — quem lê o orçamento percebe de onde vem cada valor e o que muda se a solução mudar."]' WHERE s.slug = 'orcamentacao' AND st.locale = 'pt';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["A fiscalização representa o interesse de quem paga a obra. Verificamos o que está a ser executado contra o que foi contratado e registamos o que encontramos, para que as decisões fiquem documentadas e não dependam de memória."]' WHERE s.slug = 'fiscalizacao' AND st.locale = 'pt';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["Um edifício degrada-se de forma previsível. Tratar a degradação cedo, segundo um plano, custa uma fracção do que custa reagir a uma patologia já instalada."]' WHERE s.slug = 'reforma-e-manutencao' AND st.locale = 'pt';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["Numa estrutura metálica, o erro não se corrige com argamassa. A coordenação entre desenho, fabrico e montagem é o que separa uma estrutura que assenta à primeira de uma que consome semanas em ajustes."]' WHERE s.slug = 'estruturas-metalicas' AND st.locale = 'pt';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["Uma piscina é uma obra de engenharia com acabamento à vista. Estrutura, impermeabilização, hidráulica e revestimento têm de ser decididos em conjunto — é aí que se ganha ou perde a durabilidade."]' WHERE s.slug = 'piscinas' AND st.locale = 'pt';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["We structure the build before it starts and keep that plan alive while it runs. The aim is not a good-looking programme, but a defensible answer, at any moment, to \\"where are we\\" and \\"what happens next\\"."]' WHERE s.slug = 'planeamento-e-controlo-de-obras' AND st.locale = 'en';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["A budget exists to support a decision, not just to be approved. We work from measured quantities and stated assumptions, so whoever reads the estimate can see where each figure comes from and what changes if the solution changes."]' WHERE s.slug = 'orcamentacao' AND st.locale = 'en';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["Supervision represents the interest of whoever is paying for the build. We verify what is being executed against what was contracted and record what we find, so decisions are documented rather than remembered."]' WHERE s.slug = 'fiscalizacao' AND st.locale = 'en';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["A building deteriorates predictably. Treating that deterioration early, to a plan, costs a fraction of reacting to a defect that has already taken hold."]' WHERE s.slug = 'reforma-e-manutencao' AND st.locale = 'en';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["In a steel structure, an error cannot be corrected with mortar. Coordination between design, fabrication and erection is what separates a frame that fits first time from one that consumes weeks in adjustments."]' WHERE s.slug = 'estruturas-metalicas' AND st.locale = 'en';
UPDATE `service_translations` st JOIN `services` s ON s.id = st.service_id SET st.body = '["A pool is an engineering work with an exposed finish. Structure, waterproofing, hydraulics and finishes have to be decided together — that is where durability is won or lost."]' WHERE s.slug = 'piscinas' AND st.locale = 'en';

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

-- Definições ---------------------------------------------------------------
INSERT IGNORE INTO `settings` (`id`, `phone`, `email`, `address_street`, `address_city`, `slogan`, `hours_pt`, `hours_en`, `linkedin`, `instagram`, `facebook`, `cover_image`, `cover_alt_pt`, `cover_alt_en`) VALUES ('singleton', '+244 927 635 946', 'geral@inovholding.com', 'Avenida Comandante Gika, 241, 1C', 'Luanda', 'Projects Build Future', 'Segunda a sexta, 08h00 – 17h00', 'Monday to Friday, 08:00 – 17:00', '', '', '', '/images/hero-obra.jpg', '', '');

-- Textos das páginas --------------------------------------------------------
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'meta', '{"siteName":"Meteoro 24","titleTemplate":"%s · Meteoro 24","defaultTitle":"Meteoro 24 · Construção e Gestão de Projectos","defaultDescription":"Planeamos, controlamos e executamos projectos no ramo da construção em Angola. Construção com método. Gestão com rigor."}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'nav', '{"home":"Início","about":"Sobre","services":"Serviços","method":"Método","projects":"Projectos","careers":"Carreiras","contact":"Contacto","menu":"Menu","close":"Fechar","skipToContent":"Saltar para o conteúdo"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'common', '{"scroll":"Descer","readMore":"Saber mais","allServices":"Todos os serviços","talkToUs":"Falar connosco","nextService":"Serviço seguinte","previousService":"Serviço anterior","backHome":"Voltar ao início","languageLabel":"Idioma"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'home', '{"hero":{"eyebrow":"Angola · Construção e Gestão de Projectos","statement":["Construção com método.","Gestão com rigor."],"lead":"Planeamos, controlamos e executamos projectos no ramo da construção.","ctaPrimary":"Falar connosco","ctaSecondary":"Ver serviços"},"intro":{"eyebrow":"A obra começa antes do estaleiro","title":"Construir bem começa com decisões bem estruturadas.","lead":"Cada escolha tomada antes e durante a execução influencia directamente o custo, o prazo, a qualidade e a durabilidade do resultado.","pillars":[{"key":"clareza","label":"Clareza","text":"sobre o que será feito"},{"key":"controlo","label":"Controlo","text":"sobre recursos e execução"},{"key":"confianca","label":"Confiança","text":"sobre o resultado entregue"}]},"about":{"eyebrow":"A Meteoro 24","title":"Execução e gestão numa única responsabilidade.","body":["Não actuamos apenas na frente de obra. Estruturamos o projecto, organizamos os recursos, acompanhamos a execução e mantemos o cliente informado em cada etapa."],"keywords":["Planear","Coordenar","Controlar","Executar"],"cta":"Conhecer a empresa"},"services":{"eyebrow":"O que fazemos","title":"Seis serviços. Uma visão integrada.","lead":"Da primeira medição à entrega final, cada serviço alimenta o seguinte com informação verificada.","cta":"Ver todos os serviços"},"method":{"eyebrow":"Como trabalhamos","title":"Um processo claro do início à entrega.","note":"Cada etapa produz informação para a seguinte e reduz a margem de improvisação.","cta":"Ver o método completo"},"value":{"eyebrow":"O valor para o cliente","title":"Mais controlo sobre a obra. Menos incerteza nas decisões.","items":[{"number":"01","title":"Previsibilidade","text":"Planeamento e acompanhamento para antecipar desvios de prazo e custo."},{"number":"02","title":"Transparência","text":"Informação organizada para compreender a evolução e as decisões do projecto."},{"number":"03","title":"Responsabilidade","text":"Uma equipa orientada para coordenar, verificar e entregar com rigor."}]},"cta":{"eyebrow":"O próximo projecto","title":"Vamos transformar a sua necessidade num plano concreto.","lead":"Projectos bem pensados. Bem geridos. Bem executados.","button":"Iniciar conversa"}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'about', '{"hero":{"eyebrow":"A Meteoro 24","title":"Execução e gestão numa única responsabilidade.","lead":"Construção e gestão de projectos em Angola, com o mesmo rigor antes, durante e depois da obra."},"story":{"title":"A obra começa antes do estaleiro","body":["Construir bem começa com decisões bem estruturadas. Cada escolha tomada antes e durante a execução influencia directamente o custo, o prazo, a qualidade e a durabilidade do resultado.","É por isso que tratamos o planeamento como parte da obra e não como um documento que fica na gaveta. O plano é o instrumento com que se decide, se corrige e se responde a imprevistos."]},"principle":{"title":"Não actuamos apenas na frente de obra.","body":["Estruturamos o projecto, organizamos os recursos, acompanhamos a execução e mantemos o cliente informado em cada etapa.","Reunir a execução e a gestão sob a mesma responsabilidade elimina a zona cinzenta onde normalmente se perdem prazos, se acumulam custos e se diluem responsabilidades."],"keywords":["Planear","Coordenar","Controlar","Executar"]},"pillars":{"title":"O que o cliente recebe em cada projecto","items":[{"key":"clareza","label":"Clareza","text":"sobre o que será feito"},{"key":"controlo","label":"Controlo","text":"sobre recursos e execução"},{"key":"confianca","label":"Confiança","text":"sobre o resultado entregue"}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'method', '{"hero":{"eyebrow":"Como trabalhamos","title":"Um processo claro do início à entrega.","lead":"Cinco etapas encadeadas. Cada uma produz a informação de que a seguinte precisa."},"steps":[{"number":"01","title":"Compreender","text":"Necessidades e condicionantes. Antes de propor soluções, identificamos o que o projecto exige e o que o limita — terreno, orçamento, prazo, licenciamento e expectativa do cliente."},{"number":"02","title":"Estruturar","text":"Âmbito, recursos e plano. Definimos o que entra e o que fica de fora, que meios são necessários e em que sequência as frentes avançam."},{"number":"03","title":"Executar","text":"Coordenação das frentes. Equipas, fornecedores e especialidades trabalham segundo um plano comum, com responsabilidades atribuídas."},{"number":"04","title":"Controlar","text":"Qualidade, custo e prazo. Medimos o que foi feito contra o que estava previsto e agimos sobre o desvio enquanto ainda é corrigível."},{"number":"05","title":"Entregar","text":"Conclusão e continuidade. A obra é encerrada com a informação organizada para quem a vai usar e manter."}],"note":"Cada etapa produz informação para a seguinte e reduz a margem de improvisação.","value":{"title":"O que este processo entrega","items":[{"number":"01","title":"Previsibilidade","text":"Planeamento e acompanhamento para antecipar desvios de prazo e custo."},{"number":"02","title":"Transparência","text":"Informação organizada para compreender a evolução e as decisões do projecto."},{"number":"03","title":"Responsabilidade","text":"Uma equipa orientada para coordenar, verificar e entregar com rigor."}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'projects', '{"hero":{"eyebrow":"Projectos","title":"Tipologias de intervenção.","lead":"As áreas em que trabalhamos e o tipo de obra que coordenamos."},"notice":{"title":"Portefólio em preparação","body":"Estamos a organizar o registo fotográfico e técnico das obras concluídas. Até lá, apresentamos as tipologias de intervenção. Para referências concretas de obras semelhantes à sua, fale connosco."},"typologies":{"title":"Onde intervimos","lead":"Cada tipologia exige uma combinação diferente dos nossos serviços."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'careers', '{"hero":{"eyebrow":"Estamos a recrutar","title":"Construa connosco o que fica de pé.","lead":"A Meteoro 24 cresce com quem leva a construção a sério. Procuramos pessoas rigorosas, organizadas e com vontade de fazer bem à primeira."},"why":{"title":"Porquê a Meteoro 24?","items":[{"title":"Trabalho com método","text":"Aqui planeia-se antes de executar. O rigor não é slogan — é a forma como trabalhamos todos os dias."},{"title":"Obra de ponta a ponta","text":"Da orçamentação à entrega, acompanha o projecto inteiro. Aprende-se muito quando se vê a obra toda."},{"title":"Crescimento real","text":"Estamos em expansão. Há espaço para crescer com a empresa e assumir mais responsabilidade."},{"title":"Responsabilidade a sério","text":"Damos autonomia a quem a merece e respondemos pelo que entregamos. Procuramos o mesmo em cada pessoa."}]},"jobs":{"title":"Vagas em aberto","lead":"As posições que estamos a preencher agora. Não encontra a sua? Envie uma candidatura espontânea.","profileLabel":"Perfil","empty":"De momento não há vagas em aberto. Pode enviar uma candidatura espontânea — guardamos o seu CV para quando surgir a oportunidade certa.","apply":"Candidatar-me","details":"Ver detalhes","share":"Partilhar"},"spontaneous":{"title":"Candidatura espontânea","text":"Não há uma vaga que encaixe consigo? Envie o seu CV na mesma. Quando abrir uma posição adequada, é dos primeiros a saber.","label":"Candidatura espontânea"},"form":{"title":"Formulário de candidatura","lead":"Preencha os dados e anexe o seu CV. Respondemos a todas as candidaturas.","name":"Nome completo","email":"Email","phone":"Telefone","position":"Vaga","spontaneousOption":"Candidatura espontânea","message":"Mensagem","messageHint":"Diga-nos porque quer trabalhar connosco (opcional).","cv":"Currículo (CV)","cvHint":"PDF, DOC ou DOCX, até 5 MB.","submit":"Enviar candidatura","sending":"A enviar...","success":"Candidatura recebida. Obrigado — entraremos em contacto.","error":"Não foi possível enviar a candidatura. Tente novamente ou escreva-nos directamente.","required":"Campo obrigatório","invalidEmail":"Introduza um email válido","cvRequired":"Anexe o seu CV.","privacy":"Os dados e o CV enviados são usados apenas para avaliar a sua candidatura."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'contact', '{"hero":{"eyebrow":"O próximo projecto","title":"Vamos transformar a sua necessidade num plano concreto.","lead":"Descreva o que precisa. Respondemos com o enquadramento possível e os passos seguintes."},"details":{"title":"Contactos directos","phoneLabel":"Telefone","emailLabel":"Email","addressLabel":"Morada","hoursLabel":"Horário"},"form":{"title":"Enviar mensagem","name":"Nome","email":"Email","phone":"Telefone","subject":"Assunto","subjectOptions":["Planeamento e controlo de obras","Orçamentação","Fiscalização","Reforma e manutenção","Estruturas metálicas","Construção de piscinas","Outro assunto"],"message":"Mensagem","submit":"Enviar mensagem","sending":"A enviar...","success":"Mensagem enviada. Entraremos em contacto brevemente.","error":"Não foi possível enviar a mensagem. Tente novamente ou contacte-nos directamente.","required":"Campo obrigatório","invalidEmail":"Introduza um email válido","privacy":"Os dados enviados são usados apenas para responder ao seu contacto."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'footer', '{"sections":{"company":"Empresa","services":"Serviços","contact":"Contacto"},"rights":"Todos os direitos reservados.","country":"Angola"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'meta', '{"siteName":"Meteoro 24","titleTemplate":"%s · Meteoro 24","defaultTitle":"Meteoro 24 · Construction and Project Management","defaultDescription":"We plan, control and deliver construction projects in Angola. Construction with method. Management with rigour."}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'nav', '{"home":"Home","about":"About","services":"Services","method":"Method","projects":"Projects","careers":"Careers","contact":"Contact","menu":"Menu","close":"Close","skipToContent":"Skip to content"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'common', '{"scroll":"Scroll","readMore":"Read more","allServices":"All services","talkToUs":"Talk to us","nextService":"Next service","previousService":"Previous service","backHome":"Back to home","languageLabel":"Language"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'home', '{"hero":{"eyebrow":"Angola · Construction and Project Management","statement":["Construction with method.","Management with rigour."],"lead":"We plan, control and deliver projects across the construction sector.","ctaPrimary":"Talk to us","ctaSecondary":"View services"},"intro":{"eyebrow":"The build starts before the site does","title":"Building well starts with well-structured decisions.","lead":"Every choice made before and during execution has a direct effect on cost, schedule, quality and how long the result lasts.","pillars":[{"key":"clareza","label":"Clarity","text":"about what will be built"},{"key":"controlo","label":"Control","text":"over resources and execution"},{"key":"confianca","label":"Confidence","text":"in the result delivered"}]},"about":{"eyebrow":"Meteoro 24","title":"Delivery and management under a single responsibility.","body":["We do not work on the site alone. We structure the project, organise the resources, follow the execution and keep the client informed at every stage."],"keywords":["Plan","Coordinate","Control","Deliver"],"cta":"About the company"},"services":{"eyebrow":"What we do","title":"Six services. One integrated view.","lead":"From the first measurement to final handover, each service feeds the next with verified information.","cta":"View all services"},"method":{"eyebrow":"How we work","title":"A clear process from start to handover.","note":"Each stage produces the information the next one needs, and leaves less room for improvisation.","cta":"See the full method"},"value":{"eyebrow":"Value for the client","title":"More control over the build. Less uncertainty in decisions.","items":[{"number":"01","title":"Predictability","text":"Planning and monitoring that anticipate schedule and cost deviations."},{"number":"02","title":"Transparency","text":"Information organised so you can follow progress and understand each decision."},{"number":"03","title":"Accountability","text":"A team set up to coordinate, verify and deliver with rigour."}]},"cta":{"eyebrow":"Your next project","title":"Let us turn your requirement into a concrete plan.","lead":"Well considered. Well managed. Well built.","button":"Start a conversation"}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'about', '{"hero":{"eyebrow":"Meteoro 24","title":"Delivery and management under a single responsibility.","lead":"Construction and project management in Angola, held to the same standard before, during and after the build."},"story":{"title":"The build starts before the site does","body":["Building well starts with well-structured decisions. Every choice made before and during execution has a direct effect on cost, schedule, quality and how long the result lasts.","That is why we treat planning as part of the build rather than as a document filed away. The plan is the instrument used to decide, to correct and to respond when something unexpected happens."]},"principle":{"title":"We do not work on the site alone.","body":["We structure the project, organise the resources, follow the execution and keep the client informed at every stage.","Holding delivery and management under the same responsibility removes the grey area where schedules usually slip, costs accumulate and accountability dissolves."],"keywords":["Plan","Coordinate","Control","Deliver"]},"pillars":{"title":"What the client gets on every project","items":[{"key":"clareza","label":"Clarity","text":"about what will be built"},{"key":"controlo","label":"Control","text":"over resources and execution"},{"key":"confianca","label":"Confidence","text":"in the result delivered"}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'method', '{"hero":{"eyebrow":"How we work","title":"A clear process from start to handover.","lead":"Five linked stages. Each one produces the information the next stage depends on."},"steps":[{"number":"01","title":"Understand","text":"Requirements and constraints. Before proposing solutions we establish what the project demands and what limits it — site, budget, schedule, permitting and client expectations."},{"number":"02","title":"Structure","text":"Scope, resources and plan. We define what is in and what is out, which resources are needed and in what sequence the work fronts advance."},{"number":"03","title":"Execute","text":"Coordination of work fronts. Teams, suppliers and trades work to a shared plan, with responsibilities assigned."},{"number":"04","title":"Control","text":"Quality, cost and schedule. We measure what was built against what was planned and act on the deviation while it can still be corrected."},{"number":"05","title":"Deliver","text":"Completion and continuity. The build is closed out with the information organised for whoever will use and maintain it."}],"note":"Each stage produces the information the next one needs, and leaves less room for improvisation.","value":{"title":"What this process delivers","items":[{"number":"01","title":"Predictability","text":"Planning and monitoring that anticipate schedule and cost deviations."},{"number":"02","title":"Transparency","text":"Information organised so you can follow progress and understand each decision."},{"number":"03","title":"Accountability","text":"A team set up to coordinate, verify and deliver with rigour."}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'projects', '{"hero":{"eyebrow":"Projects","title":"Types of work.","lead":"The areas we work in and the kind of build we coordinate."},"notice":{"title":"Portfolio in preparation","body":"We are organising the photographic and technical record of completed works. Until then, this page presents the types of work we take on. For references on builds similar to yours, get in touch."},"typologies":{"title":"Where we work","lead":"Each type of work calls for a different combination of our services."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'careers', '{"hero":{"eyebrow":"We are hiring","title":"Build with us what stands.","lead":"Meteoro 24 grows with people who take construction seriously. We look for rigorous, organised people who want to get it right the first time."},"why":{"title":"Why Meteoro 24?","items":[{"title":"Work with method","text":"Here we plan before we build. Rigour is not a slogan — it is how we work every day."},{"title":"The whole build","text":"From estimating to handover, you follow the entire project. You learn a lot when you see the whole thing."},{"title":"Real growth","text":"We are expanding. There is room to grow with the company and take on more responsibility."},{"title":"Real accountability","text":"We give autonomy to those who earn it and stand behind what we deliver. We look for the same in every person."}]},"jobs":{"title":"Open positions","lead":"The roles we are filling right now. Not seeing yours? Send a spontaneous application.","profileLabel":"Profile","empty":"There are no open positions at the moment. You can still send a spontaneous application — we keep your CV for when the right role comes up.","apply":"Apply","details":"View details","share":"Share"},"spontaneous":{"title":"Spontaneous application","text":"No role that fits you? Send your CV anyway. When a suitable position opens, you will be among the first to know.","label":"Spontaneous application"},"form":{"title":"Application form","lead":"Fill in the fields and attach your CV. We respond to every application.","name":"Full name","email":"Email","phone":"Phone","position":"Position","spontaneousOption":"Spontaneous application","message":"Message","messageHint":"Tell us why you want to work with us (optional).","cv":"Résumé (CV)","cvHint":"PDF, DOC or DOCX, up to 5 MB.","submit":"Send application","sending":"Sending...","success":"Application received. Thank you — we will be in touch.","error":"The application could not be sent. Please try again or write to us directly.","required":"Required field","invalidEmail":"Enter a valid email address","cvRequired":"Attach your CV.","privacy":"The data and CV you send are used only to assess your application."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'contact', '{"hero":{"eyebrow":"Your next project","title":"Let us turn your requirement into a concrete plan.","lead":"Tell us what you need. We reply with an initial framing and the next steps."},"details":{"title":"Direct contacts","phoneLabel":"Phone","emailLabel":"Email","addressLabel":"Address","hoursLabel":"Hours"},"form":{"title":"Send a message","name":"Name","email":"Email","phone":"Phone","subject":"Subject","subjectOptions":["Works planning and control","Cost estimating","Site supervision","Refurbishment and maintenance","Steel structures","Swimming pool construction","Other"],"message":"Message","submit":"Send message","sending":"Sending...","success":"Message sent. We will be in touch shortly.","error":"The message could not be sent. Please try again or contact us directly.","required":"Required field","invalidEmail":"Enter a valid email address","privacy":"The data you send is used only to reply to your enquiry."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'footer', '{"sections":{"company":"Company","services":"Services","contact":"Contact"},"rights":"All rights reserved.","country":"Angola"}');

-- Serviços ------------------------------------------------------------------
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('a74962cc-4080-4574-bbcb-e5f092799859', 'planeamento-e-controlo-de-obras', '01', 0, 1, '/images/equipa-gabinete.jpg', 'Dois engenheiros a analisar plantas e cronograma em gabinete de obra', 'Two engineers reviewing drawings and a programme in a site office');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('a74962cc-4080-4574-bbcb-e5f092799859', 'pt', 'Planeamento e controlo de obras', 'Organização das etapas, recursos e prioridades, com acompanhamento contínuo da execução.', 'O plano não é um documento. É o instrumento com que se decide durante a obra.', '["Estruturamos a obra antes de ela começar e mantemos esse plano vivo enquanto decorre. O objectivo não é produzir um cronograma bonito, mas ter, a qualquer momento, uma resposta fundamentada para \\"onde estamos\\" e \\"o que acontece a seguir\\"."]', '[{"title":"Plano de execução","text":"Organização das etapas, recursos, dependências e prioridades."},{"title":"Cronograma acompanhado","text":"Monitorização da evolução e identificação antecipada de desvios."},{"title":"Decisão sustentada","text":"Informação clara para responder a riscos e mudanças durante a obra."}]', '["Planear","Acompanhar","Decidir"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('a74962cc-4080-4574-bbcb-e5f092799859', 'en', 'Works planning and control', 'Sequencing of stages, resources and priorities, with continuous monitoring of execution.', 'The plan is not a document. It is the instrument you decide with while the work is running.', '["We structure the build before it starts and keep that plan alive while it runs. The aim is not a good-looking programme, but a defensible answer, at any moment, to \\"where are we\\" and \\"what happens next\\"."]', '[{"title":"Execution plan","text":"Sequencing of stages, resources, dependencies and priorities."},{"title":"Monitored programme","text":"Progress tracking and early identification of deviations."},{"title":"Informed decisions","text":"Clear information to respond to risk and change during the build."}]', '["Plan","Monitor","Decide"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('61c54bbe-93b1-4d30-9e13-823a747556e9', 'orcamentacao', '02', 1, 1, NULL, '', '');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('61c54bbe-93b1-4d30-9e13-823a747556e9', 'pt', 'Orçamentação', 'Medições, mapas de quantidades e estimativas que tornam o investimento transparente antes da execução.', 'Custo previsto. Execução verificada.', '["Um orçamento serve para decidir, não apenas para aprovar. Por isso trabalhamos a partir de quantidades medidas e de pressupostos explícitos — quem lê o orçamento percebe de onde vem cada valor e o que muda se a solução mudar."]', '[{"title":"Medir","text":"Levantamento e medição do que a obra exige, item a item."},{"title":"Estimar","text":"Preços e rendimentos aplicados a quantidades reais, com pressupostos escritos."},{"title":"Consolidar","text":"Mapa de quantidades e orçamento organizados para comparação e decisão."}]', '["Medir","Estimar","Consolidar"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('61c54bbe-93b1-4d30-9e13-823a747556e9', 'en', 'Cost estimating', 'Measurements, bills of quantities and estimates that make the investment transparent before execution.', 'Cost forecast. Execution verified.', '["A budget exists to support a decision, not just to be approved. We work from measured quantities and stated assumptions, so whoever reads the estimate can see where each figure comes from and what changes if the solution changes."]', '[{"title":"Measure","text":"Survey and measurement of what the build requires, item by item."},{"title":"Estimate","text":"Rates and outputs applied to real quantities, with assumptions written down."},{"title":"Consolidate","text":"Bill of quantities and budget organised for comparison and decision."}]', '["Measure","Estimate","Consolidate"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('16f873b7-1eb6-424c-967b-86856ab7ba68', 'fiscalizacao', '03', 2, 1, '/images/hero-obra.jpg', 'Engenheiro a consultar plantas em frente a edifício em construção', 'Engineer reading drawings in front of a building under construction');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('16f873b7-1eb6-424c-967b-86856ab7ba68', 'pt', 'Fiscalização', 'Acompanhamento da qualidade, conformidade, quantidades, prazos e condições definidas para a obra.', 'Verificar no momento certo custa menos do que corrigir depois.', '["A fiscalização representa o interesse de quem paga a obra. Verificamos o que está a ser executado contra o que foi contratado e registamos o que encontramos, para que as decisões fiquem documentadas e não dependam de memória."]', '[{"title":"Acompanhar","text":"Presença em obra e verificação da execução face ao projecto."},{"title":"Validar","text":"Conformidade técnica, quantidades executadas e condições contratuais."},{"title":"Reportar","text":"Relatórios periódicos com estado, desvios e recomendações."}]', '["Acompanhar","Validar","Reportar"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('16f873b7-1eb6-424c-967b-86856ab7ba68', 'en', 'Site supervision', 'Monitoring of quality, compliance, quantities, schedule and the conditions agreed for the works.', 'Checking at the right moment costs less than correcting afterwards.', '["Supervision represents the interest of whoever is paying for the build. We verify what is being executed against what was contracted and record what we find, so decisions are documented rather than remembered."]', '[{"title":"Monitor","text":"Presence on site and verification of execution against the design."},{"title":"Validate","text":"Technical compliance, quantities executed and contractual conditions."},{"title":"Report","text":"Periodic reports covering status, deviations and recommendations."}]', '["Monitor","Validate","Report"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('a6040683-e641-470b-b80b-000c2a2c087a', 'reforma-e-manutencao', '04', 3, 1, NULL, '', '');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('a6040683-e641-470b-b80b-000c2a2c087a', 'pt', 'Reforma e manutenção preventiva de edificações', 'Intervenções planeadas para adaptar espaços, corrigir patologias e prolongar a vida útil das edificações.', 'Reformar recupera valor. Manter protege o investimento.', '["Um edifício degrada-se de forma previsível. Tratar a degradação cedo, segundo um plano, custa uma fracção do que custa reagir a uma patologia já instalada."]', '[{"title":"Reforma","text":"Adaptação de espaços e correcção de patologias existentes."},{"title":"Manutenção preventiva","text":"Intervenções programadas antes de o problema se tornar obra."},{"title":"Continuidade","text":"Acompanhamento ao longo do tempo, com histórico do que foi feito."}]', '["Reforma","Manutenção preventiva","Continuidade"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('a6040683-e641-470b-b80b-000c2a2c087a', 'en', 'Refurbishment and preventive maintenance', 'Planned works to adapt spaces, correct defects and extend the service life of buildings.', 'Refurbishment recovers value. Maintenance protects the investment.', '["A building deteriorates predictably. Treating that deterioration early, to a plan, costs a fraction of reacting to a defect that has already taken hold."]', '[{"title":"Refurbishment","text":"Adaptation of spaces and correction of existing defects."},{"title":"Preventive maintenance","text":"Scheduled works before the problem becomes a construction job."},{"title":"Continuity","text":"Ongoing monitoring, with a record of what has been done."}]', '["Refurbishment","Preventive maintenance","Continuity"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('63850140-fa42-46d2-a29d-0e6aadd49621', 'estruturas-metalicas', '05', 4, 1, '/images/estrutura-metalica.jpg', 'Estrutura metálica montada em edifício em construção ao pôr do sol', 'Steel frame erected on a building under construction at sunset');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('63850140-fa42-46d2-a29d-0e6aadd49621', 'pt', 'Estruturas metálicas', 'Concepção, fabrico e montagem coordenados para alcançar segurança, desempenho e qualidade nos detalhes.', 'Estruturas metálicas com precisão.', '["Numa estrutura metálica, o erro não se corrige com argamassa. A coordenação entre desenho, fabrico e montagem é o que separa uma estrutura que assenta à primeira de uma que consome semanas em ajustes."]', '[{"title":"Concepção","text":"Solução estrutural e pormenorização compatibilizadas com o projecto."},{"title":"Fabrico","text":"Produção controlada, com verificação dimensional antes de sair para obra."},{"title":"Montagem","text":"Sequência de montagem planeada, com condições de segurança definidas."}]', '["Concepção","Fabrico","Montagem"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('63850140-fa42-46d2-a29d-0e6aadd49621', 'en', 'Steel structures', 'Design, fabrication and erection coordinated to achieve safety, performance and quality in the details.', 'Steel structures built to precision.', '["In a steel structure, an error cannot be corrected with mortar. Coordination between design, fabrication and erection is what separates a frame that fits first time from one that consumes weeks in adjustments."]', '[{"title":"Design","text":"Structural solution and detailing coordinated with the wider project."},{"title":"Fabrication","text":"Controlled production, with dimensional checks before it leaves for site."},{"title":"Erection","text":"A planned erection sequence, with safety conditions defined."}]', '["Design","Fabrication","Erection"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('88c6b0f5-8eed-4f6a-9f8d-fa574675e33f', 'piscinas', '06', 5, 1, '/images/piscina.jpg', 'Piscina integrada na arquitectura de uma moradia ao entardecer', 'Swimming pool integrated into the architecture of a house at dusk');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('88c6b0f5-8eed-4f6a-9f8d-fa574675e33f', 'pt', 'Construção de piscinas', 'Da solução técnica aos acabamentos e sistemas de funcionamento, coordenamos cada etapa.', 'Piscinas pensadas como parte da arquitectura.', '["Uma piscina é uma obra de engenharia com acabamento à vista. Estrutura, impermeabilização, hidráulica e revestimento têm de ser decididos em conjunto — é aí que se ganha ou perde a durabilidade."]', '[{"title":"Projecto","text":"Solução técnica integrada na arquitectura e no terreno."},{"title":"Construção","text":"Estrutura, impermeabilização e sistemas hidráulicos executados com controlo."},{"title":"Acabamento","text":"Revestimentos, equipamentos e ensaios de funcionamento antes da entrega."}]', '["Projecto","Construção","Acabamento"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('88c6b0f5-8eed-4f6a-9f8d-fa574675e33f', 'en', 'Swimming pool construction', 'From the technical solution to finishes and plant, we coordinate every stage.', 'Pools designed as part of the architecture.', '["A pool is an engineering work with an exposed finish. Structure, waterproofing, hydraulics and finishes have to be decided together — that is where durability is won or lost."]', '[{"title":"Design","text":"A technical solution integrated with the architecture and the site."},{"title":"Construction","text":"Structure, waterproofing and hydraulic systems executed under control."},{"title":"Finishing","text":"Finishes, equipment and commissioning tests before handover."}]', '["Design","Construction","Finishing"]');

-- Vagas --------------------------------------------------------------------
INSERT IGNORE INTO `jobs` (`id`, `slug`, `position`, `published`) VALUES ('1a6d8965-00db-4175-b044-78843c8d08c6', 'engenheiro-civil-direccao-de-obra', 0, 1);
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('1a6d8965-00db-4175-b044-78843c8d08c6', 'pt', 'Engenheiro(a) Civil — Direcção de Obra', 'Produção & Obra', 'Tempo inteiro', 'Luanda, Angola', 'A Meteoro 24 procura um(a) Engenheiro(a) Civil para dirigir obra no terreno, coordenar as frentes e garantir que o que foi planeado é o que se executa.', '[{"title":"O que irá fazer","items":["Coordenar as frentes de trabalho e as equipas em obra","Controlar prazos, custos e qualidade contra o plano de execução","Acompanhar medições, autos e mapas de quantidades","Fazer a ligação entre projecto, fornecedores e fiscalização","Reportar o avanço e antecipar desvios"]},{"title":"Requisitos","items":["Licenciatura em Engenharia Civil","Mínimo de 3 anos de experiência em direcção ou acompanhamento de obra","Domínio de leitura de projecto e de cronogramas","Conhecimento de AutoCAD e de folha de cálculo","Carta de condução"]},{"title":"Valorizamos","items":["Experiência em estruturas metálicas","Inglês técnico","MS Project ou equivalente"]}]', 'Rigor, liderança de equipas, organização e capacidade de decidir no terreno.');
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('1a6d8965-00db-4175-b044-78843c8d08c6', 'en', 'Civil Engineer — Site Management', 'Production & Site', 'Full-time', 'Luanda, Angola', 'Meteoro 24 is looking for a Civil Engineer to run works on site, coordinate the work fronts and make sure what was planned is what gets built.', '[{"title":"What you will do","items":["Coordinate work fronts and site teams","Control schedule, cost and quality against the execution plan","Follow measurements, progress records and bills of quantities","Bridge design, suppliers and supervision","Report progress and anticipate deviations"]},{"title":"Requirements","items":["Degree in Civil Engineering","Minimum 3 years of site management or supervision experience","Fluent reading of drawings and programmes","Command of AutoCAD and spreadsheets","Driver\'s licence"]},{"title":"Nice to have","items":["Experience with steel structures","Technical English","MS Project or equivalent"]}]', 'Rigour, team leadership, organisation and the ability to decide on site.');
INSERT IGNORE INTO `jobs` (`id`, `slug`, `position`, `published`) VALUES ('e044a3df-d0be-424d-9601-05e7d7beac33', 'tecnico-de-orcamentacao-e-medicoes', 1, 1);
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('e044a3df-d0be-424d-9601-05e7d7beac33', 'pt', 'Técnico(a) de Orçamentação e Medições', 'Estudos & Orçamentação', 'Tempo inteiro', 'Luanda, Angola', 'Procuramos um(a) técnico(a) meticuloso(a) para medir, orçamentar e preparar mapas de quantidades que tornem o investimento transparente antes de a obra começar.', '[{"title":"O que irá fazer","items":["Fazer medições e levantamentos a partir de projecto","Elaborar mapas de quantidades e estimativas de custo","Consultar fornecedores e consolidar preços","Apoiar a preparação de propostas"]},{"title":"Requisitos","items":["Formação em Engenharia Civil, Construção ou área técnica","Experiência em medições e orçamentação","Domínio de Excel e de leitura de projecto","Método e atenção ao detalhe"]},{"title":"Valorizamos","items":["Conhecimento de software de orçamentação","AutoCAD","Inglês funcional"]}]', 'Atenção ao detalhe, método, honestidade nos números.');
INSERT IGNORE INTO `job_translations` (`job_id`, `locale`, `title`, `department`, `type`, `location`, `intro`, `sections`, `profile`) VALUES ('e044a3df-d0be-424d-9601-05e7d7beac33', 'en', 'Cost Estimating & Quantities Technician', 'Studies & Estimating', 'Full-time', 'Luanda, Angola', 'We are looking for a meticulous technician to measure, estimate and prepare bills of quantities that make the investment transparent before the build starts.', '[{"title":"What you will do","items":["Take measurements and surveys from drawings","Prepare bills of quantities and cost estimates","Consult suppliers and consolidate prices","Support proposal preparation"]},{"title":"Requirements","items":["Training in Civil Engineering, Construction or a technical field","Experience in measurements and estimating","Command of Excel and reading of drawings","Method and attention to detail"]},{"title":"Nice to have","items":["Knowledge of estimating software","AutoCAD","Functional English"]}]', 'Attention to detail, method, honesty with numbers.');
