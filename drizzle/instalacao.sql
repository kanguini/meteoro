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

-- Definições ---------------------------------------------------------------
INSERT IGNORE INTO `settings` (`id`, `phone`, `email`, `address_street`, `address_city`, `slogan`, `hours_pt`, `hours_en`, `linkedin`, `instagram`, `facebook`, `cover_image`, `cover_alt_pt`, `cover_alt_en`) VALUES ('singleton', '+244 927 635 946', 'geral@inovholding.com', 'Avenida Comandante Gika, 241, 1C', 'Luanda', 'Projects Build Future', 'Segunda a sexta, 08h00 – 17h00', 'Monday to Friday, 08:00 – 17:00', '', '', '', '/images/hero-obra.jpg', '', '');

-- Textos das páginas --------------------------------------------------------
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'meta', '{"siteName":"Meteoro 24","titleTemplate":"%s · Meteoro 24","defaultTitle":"Meteoro 24 · Construção e Gestão de Projectos","defaultDescription":"Planeamos, controlamos e executamos projectos no ramo da construção em Angola. Construção com método. Gestão com rigor."}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'nav', '{"home":"Início","about":"Sobre","services":"Serviços","method":"Método","projects":"Projectos","contact":"Contacto","menu":"Menu","close":"Fechar","skipToContent":"Saltar para o conteúdo"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'common', '{"scroll":"Descer","readMore":"Saber mais","allServices":"Todos os serviços","talkToUs":"Falar connosco","nextService":"Serviço seguinte","previousService":"Serviço anterior","backHome":"Voltar ao início","languageLabel":"Idioma"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'home', '{"hero":{"eyebrow":"Angola · Construção e Gestão de Projectos","statement":["Construção com método.","Gestão com rigor."],"lead":"Planeamos, controlamos e executamos projectos no ramo da construção.","ctaPrimary":"Falar connosco","ctaSecondary":"Ver serviços"},"intro":{"eyebrow":"A obra começa antes do estaleiro","title":"Construir bem começa com decisões bem estruturadas.","lead":"Cada escolha tomada antes e durante a execução influencia directamente o custo, o prazo, a qualidade e a durabilidade do resultado.","pillars":[{"key":"clareza","label":"Clareza","text":"sobre o que será feito"},{"key":"controlo","label":"Controlo","text":"sobre recursos e execução"},{"key":"confianca","label":"Confiança","text":"sobre o resultado entregue"}]},"about":{"eyebrow":"A Meteoro 24","title":"Execução e gestão numa única responsabilidade.","body":["Não actuamos apenas na frente de obra. Estruturamos o projecto, organizamos os recursos, acompanhamos a execução e mantemos o cliente informado em cada etapa."],"keywords":["Planear","Coordenar","Controlar","Executar"],"cta":"Conhecer a empresa"},"services":{"eyebrow":"O que fazemos","title":"Seis serviços. Uma visão integrada.","lead":"Da primeira medição à entrega final, cada serviço alimenta o seguinte com informação verificada.","cta":"Ver todos os serviços"},"method":{"eyebrow":"Como trabalhamos","title":"Um processo claro do início à entrega.","note":"Cada etapa produz informação para a seguinte e reduz a margem de improvisação.","cta":"Ver o método completo"},"value":{"eyebrow":"O valor para o cliente","title":"Mais controlo sobre a obra. Menos incerteza nas decisões.","items":[{"number":"01","title":"Previsibilidade","text":"Planeamento e acompanhamento para antecipar desvios de prazo e custo."},{"number":"02","title":"Transparência","text":"Informação organizada para compreender a evolução e as decisões do projecto."},{"number":"03","title":"Responsabilidade","text":"Uma equipa orientada para coordenar, verificar e entregar com rigor."}]},"cta":{"eyebrow":"O próximo projecto","title":"Vamos transformar a sua necessidade num plano concreto.","lead":"Projectos bem pensados. Bem geridos. Bem executados.","button":"Iniciar conversa"}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'about', '{"hero":{"eyebrow":"A Meteoro 24","title":"Execução e gestão numa única responsabilidade.","lead":"Construção e gestão de projectos em Angola, com o mesmo rigor antes, durante e depois da obra."},"story":{"title":"A obra começa antes do estaleiro","body":["Construir bem começa com decisões bem estruturadas. Cada escolha tomada antes e durante a execução influencia directamente o custo, o prazo, a qualidade e a durabilidade do resultado.","É por isso que tratamos o planeamento como parte da obra e não como um documento que fica na gaveta. O plano é o instrumento com que se decide, se corrige e se responde a imprevistos."]},"principle":{"title":"Não actuamos apenas na frente de obra.","body":["Estruturamos o projecto, organizamos os recursos, acompanhamos a execução e mantemos o cliente informado em cada etapa.","Reunir a execução e a gestão sob a mesma responsabilidade elimina a zona cinzenta onde normalmente se perdem prazos, se acumulam custos e se diluem responsabilidades."],"keywords":["Planear","Coordenar","Controlar","Executar"]},"pillars":{"title":"O que o cliente recebe em cada projecto","items":[{"key":"clareza","label":"Clareza","text":"sobre o que será feito"},{"key":"controlo","label":"Controlo","text":"sobre recursos e execução"},{"key":"confianca","label":"Confiança","text":"sobre o resultado entregue"}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'method', '{"hero":{"eyebrow":"Como trabalhamos","title":"Um processo claro do início à entrega.","lead":"Cinco etapas encadeadas. Cada uma produz a informação de que a seguinte precisa."},"steps":[{"number":"01","title":"Compreender","text":"Necessidades e condicionantes. Antes de propor soluções, identificamos o que o projecto exige e o que o limita — terreno, orçamento, prazo, licenciamento e expectativa do cliente."},{"number":"02","title":"Estruturar","text":"Âmbito, recursos e plano. Definimos o que entra e o que fica de fora, que meios são necessários e em que sequência as frentes avançam."},{"number":"03","title":"Executar","text":"Coordenação das frentes. Equipas, fornecedores e especialidades trabalham segundo um plano comum, com responsabilidades atribuídas."},{"number":"04","title":"Controlar","text":"Qualidade, custo e prazo. Medimos o que foi feito contra o que estava previsto e agimos sobre o desvio enquanto ainda é corrigível."},{"number":"05","title":"Entregar","text":"Conclusão e continuidade. A obra é encerrada com a informação organizada para quem a vai usar e manter."}],"note":"Cada etapa produz informação para a seguinte e reduz a margem de improvisação.","value":{"title":"O que este processo entrega","items":[{"number":"01","title":"Previsibilidade","text":"Planeamento e acompanhamento para antecipar desvios de prazo e custo."},{"number":"02","title":"Transparência","text":"Informação organizada para compreender a evolução e as decisões do projecto."},{"number":"03","title":"Responsabilidade","text":"Uma equipa orientada para coordenar, verificar e entregar com rigor."}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'projects', '{"hero":{"eyebrow":"Projectos","title":"Tipologias de intervenção.","lead":"As áreas em que trabalhamos e o tipo de obra que coordenamos."},"notice":{"title":"Portefólio em preparação","body":"Estamos a organizar o registo fotográfico e técnico das obras concluídas. Até lá, apresentamos as tipologias de intervenção. Para referências concretas de obras semelhantes à sua, fale connosco."},"typologies":{"title":"Onde intervimos","lead":"Cada tipologia exige uma combinação diferente dos nossos serviços."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'contact', '{"hero":{"eyebrow":"O próximo projecto","title":"Vamos transformar a sua necessidade num plano concreto.","lead":"Descreva o que precisa. Respondemos com o enquadramento possível e os passos seguintes."},"details":{"title":"Contactos directos","phoneLabel":"Telefone","emailLabel":"Email","addressLabel":"Morada","hoursLabel":"Horário"},"form":{"title":"Enviar mensagem","name":"Nome","email":"Email","phone":"Telefone","subject":"Assunto","subjectOptions":["Planeamento e controlo de obras","Orçamentação","Fiscalização","Reforma e manutenção","Estruturas metálicas","Construção de piscinas","Outro assunto"],"message":"Mensagem","submit":"Enviar mensagem","sending":"A enviar...","success":"Mensagem enviada. Entraremos em contacto brevemente.","error":"Não foi possível enviar a mensagem. Tente novamente ou contacte-nos directamente.","required":"Campo obrigatório","invalidEmail":"Introduza um email válido","privacy":"Os dados enviados são usados apenas para responder ao seu contacto."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('pt', 'footer', '{"sections":{"company":"Empresa","services":"Serviços","contact":"Contacto"},"rights":"Todos os direitos reservados.","country":"Angola"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'meta', '{"siteName":"Meteoro 24","titleTemplate":"%s · Meteoro 24","defaultTitle":"Meteoro 24 · Construction and Project Management","defaultDescription":"We plan, control and deliver construction projects in Angola. Construction with method. Management with rigour."}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'nav', '{"home":"Home","about":"About","services":"Services","method":"Method","projects":"Projects","contact":"Contact","menu":"Menu","close":"Close","skipToContent":"Skip to content"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'common', '{"scroll":"Scroll","readMore":"Read more","allServices":"All services","talkToUs":"Talk to us","nextService":"Next service","previousService":"Previous service","backHome":"Back to home","languageLabel":"Language"}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'home', '{"hero":{"eyebrow":"Angola · Construction and Project Management","statement":["Construction with method.","Management with rigour."],"lead":"We plan, control and deliver projects across the construction sector.","ctaPrimary":"Talk to us","ctaSecondary":"View services"},"intro":{"eyebrow":"The build starts before the site does","title":"Building well starts with well-structured decisions.","lead":"Every choice made before and during execution has a direct effect on cost, schedule, quality and how long the result lasts.","pillars":[{"key":"clareza","label":"Clarity","text":"about what will be built"},{"key":"controlo","label":"Control","text":"over resources and execution"},{"key":"confianca","label":"Confidence","text":"in the result delivered"}]},"about":{"eyebrow":"Meteoro 24","title":"Delivery and management under a single responsibility.","body":["We do not work on the site alone. We structure the project, organise the resources, follow the execution and keep the client informed at every stage."],"keywords":["Plan","Coordinate","Control","Deliver"],"cta":"About the company"},"services":{"eyebrow":"What we do","title":"Six services. One integrated view.","lead":"From the first measurement to final handover, each service feeds the next with verified information.","cta":"View all services"},"method":{"eyebrow":"How we work","title":"A clear process from start to handover.","note":"Each stage produces the information the next one needs, and leaves less room for improvisation.","cta":"See the full method"},"value":{"eyebrow":"Value for the client","title":"More control over the build. Less uncertainty in decisions.","items":[{"number":"01","title":"Predictability","text":"Planning and monitoring that anticipate schedule and cost deviations."},{"number":"02","title":"Transparency","text":"Information organised so you can follow progress and understand each decision."},{"number":"03","title":"Accountability","text":"A team set up to coordinate, verify and deliver with rigour."}]},"cta":{"eyebrow":"Your next project","title":"Let us turn your requirement into a concrete plan.","lead":"Well considered. Well managed. Well built.","button":"Start a conversation"}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'about', '{"hero":{"eyebrow":"Meteoro 24","title":"Delivery and management under a single responsibility.","lead":"Construction and project management in Angola, held to the same standard before, during and after the build."},"story":{"title":"The build starts before the site does","body":["Building well starts with well-structured decisions. Every choice made before and during execution has a direct effect on cost, schedule, quality and how long the result lasts.","That is why we treat planning as part of the build rather than as a document filed away. The plan is the instrument used to decide, to correct and to respond when something unexpected happens."]},"principle":{"title":"We do not work on the site alone.","body":["We structure the project, organise the resources, follow the execution and keep the client informed at every stage.","Holding delivery and management under the same responsibility removes the grey area where schedules usually slip, costs accumulate and accountability dissolves."],"keywords":["Plan","Coordinate","Control","Deliver"]},"pillars":{"title":"What the client gets on every project","items":[{"key":"clareza","label":"Clarity","text":"about what will be built"},{"key":"controlo","label":"Control","text":"over resources and execution"},{"key":"confianca","label":"Confidence","text":"in the result delivered"}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'method', '{"hero":{"eyebrow":"How we work","title":"A clear process from start to handover.","lead":"Five linked stages. Each one produces the information the next stage depends on."},"steps":[{"number":"01","title":"Understand","text":"Requirements and constraints. Before proposing solutions we establish what the project demands and what limits it — site, budget, schedule, permitting and client expectations."},{"number":"02","title":"Structure","text":"Scope, resources and plan. We define what is in and what is out, which resources are needed and in what sequence the work fronts advance."},{"number":"03","title":"Execute","text":"Coordination of work fronts. Teams, suppliers and trades work to a shared plan, with responsibilities assigned."},{"number":"04","title":"Control","text":"Quality, cost and schedule. We measure what was built against what was planned and act on the deviation while it can still be corrected."},{"number":"05","title":"Deliver","text":"Completion and continuity. The build is closed out with the information organised for whoever will use and maintain it."}],"note":"Each stage produces the information the next one needs, and leaves less room for improvisation.","value":{"title":"What this process delivers","items":[{"number":"01","title":"Predictability","text":"Planning and monitoring that anticipate schedule and cost deviations."},{"number":"02","title":"Transparency","text":"Information organised so you can follow progress and understand each decision."},{"number":"03","title":"Accountability","text":"A team set up to coordinate, verify and deliver with rigour."}]}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'projects', '{"hero":{"eyebrow":"Projects","title":"Types of work.","lead":"The areas we work in and the kind of build we coordinate."},"notice":{"title":"Portfolio in preparation","body":"We are organising the photographic and technical record of completed works. Until then, this page presents the types of work we take on. For references on builds similar to yours, get in touch."},"typologies":{"title":"Where we work","lead":"Each type of work calls for a different combination of our services."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'contact', '{"hero":{"eyebrow":"Your next project","title":"Let us turn your requirement into a concrete plan.","lead":"Tell us what you need. We reply with an initial framing and the next steps."},"details":{"title":"Direct contacts","phoneLabel":"Phone","emailLabel":"Email","addressLabel":"Address","hoursLabel":"Hours"},"form":{"title":"Send a message","name":"Name","email":"Email","phone":"Phone","subject":"Subject","subjectOptions":["Works planning and control","Cost estimating","Site supervision","Refurbishment and maintenance","Steel structures","Swimming pool construction","Other"],"message":"Message","submit":"Send message","sending":"Sending...","success":"Message sent. We will be in touch shortly.","error":"The message could not be sent. Please try again or contact us directly.","required":"Required field","invalidEmail":"Enter a valid email address","privacy":"The data you send is used only to reply to your enquiry."}}');
INSERT IGNORE INTO `page_content` (`locale`, `page`, `data`) VALUES ('en', 'footer', '{"sections":{"company":"Company","services":"Services","contact":"Contact"},"rights":"All rights reserved.","country":"Angola"}');

-- Serviços ------------------------------------------------------------------
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('6a570d9a-decf-44e1-b58b-8e29cf6b1bb3', 'planeamento-e-controlo-de-obras', '01', 0, 1, '/images/equipa-gabinete.jpg', 'Dois engenheiros a analisar plantas e cronograma em gabinete de obra', 'Two engineers reviewing drawings and a programme in a site office');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('6a570d9a-decf-44e1-b58b-8e29cf6b1bb3', 'pt', 'Planeamento e controlo de obras', 'Organização das etapas, recursos e prioridades, com acompanhamento contínuo da execução.', 'O plano não é um documento. É o instrumento com que se decide durante a obra.', '["Estruturamos a obra antes de ela começar e mantemos esse plano vivo enquanto decorre. O objectivo não é produzir um cronograma bonito, mas ter, a qualquer momento, uma resposta fundamentada para \\"onde estamos\\" e \\"o que acontece a seguir\\"."]', '[{"title":"Plano de execução","text":"Organização das etapas, recursos, dependências e prioridades."},{"title":"Cronograma acompanhado","text":"Monitorização da evolução e identificação antecipada de desvios."},{"title":"Decisão sustentada","text":"Informação clara para responder a riscos e mudanças durante a obra."}]', '["Planear","Acompanhar","Decidir"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('6a570d9a-decf-44e1-b58b-8e29cf6b1bb3', 'en', 'Works planning and control', 'Sequencing of stages, resources and priorities, with continuous monitoring of execution.', 'The plan is not a document. It is the instrument you decide with while the work is running.', '["We structure the build before it starts and keep that plan alive while it runs. The aim is not a good-looking programme, but a defensible answer, at any moment, to \\"where are we\\" and \\"what happens next\\"."]', '[{"title":"Execution plan","text":"Sequencing of stages, resources, dependencies and priorities."},{"title":"Monitored programme","text":"Progress tracking and early identification of deviations."},{"title":"Informed decisions","text":"Clear information to respond to risk and change during the build."}]', '["Plan","Monitor","Decide"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('4afbbd31-50fe-4c34-9590-a2c539d983c2', 'orcamentacao', '02', 1, 1, NULL, '', '');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('4afbbd31-50fe-4c34-9590-a2c539d983c2', 'pt', 'Orçamentação', 'Medições, mapas de quantidades e estimativas que tornam o investimento transparente antes da execução.', 'Custo previsto. Execução verificada.', '["Medições, mapas de quantidades e estimativas que tornam o investimento mais transparente antes da execução.","Um orçamento serve para decidir, não apenas para aprovar. Por isso trabalhamos a partir de quantidades medidas e de pressupostos explícitos — quem lê o orçamento percebe de onde vem cada valor e o que muda se a solução mudar."]', '[{"title":"Medir","text":"Levantamento e medição do que a obra exige, item a item."},{"title":"Estimar","text":"Preços e rendimentos aplicados a quantidades reais, com pressupostos escritos."},{"title":"Consolidar","text":"Mapa de quantidades e orçamento organizados para comparação e decisão."}]', '["Medir","Estimar","Consolidar"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('4afbbd31-50fe-4c34-9590-a2c539d983c2', 'en', 'Cost estimating', 'Measurements, bills of quantities and estimates that make the investment transparent before execution.', 'Cost forecast. Execution verified.', '["Measurements, bills of quantities and estimates that make the investment more transparent before execution begins.","A budget exists to support a decision, not just to be approved. We work from measured quantities and stated assumptions, so whoever reads the estimate can see where each figure comes from and what changes if the solution changes."]', '[{"title":"Measure","text":"Survey and measurement of what the build requires, item by item."},{"title":"Estimate","text":"Rates and outputs applied to real quantities, with assumptions written down."},{"title":"Consolidate","text":"Bill of quantities and budget organised for comparison and decision."}]', '["Measure","Estimate","Consolidate"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('8cc9ff43-4632-461b-8e67-9e276b90f7fa', 'fiscalizacao', '03', 2, 1, '/images/hero-obra.jpg', 'Engenheiro a consultar plantas em frente a edifício em construção', 'Engineer reading drawings in front of a building under construction');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('8cc9ff43-4632-461b-8e67-9e276b90f7fa', 'pt', 'Fiscalização', 'Acompanhamento da qualidade, conformidade, quantidades, prazos e condições definidas para a obra.', 'Verificar no momento certo custa menos do que corrigir depois.', '["Acompanhamento da qualidade, conformidade, quantidades, prazos e condições definidas para a obra.","A fiscalização representa o interesse de quem paga a obra. Verificamos o que está a ser executado contra o que foi contratado e registamos o que encontramos, para que as decisões fiquem documentadas e não dependam de memória."]', '[{"title":"Acompanhar","text":"Presença em obra e verificação da execução face ao projecto."},{"title":"Validar","text":"Conformidade técnica, quantidades executadas e condições contratuais."},{"title":"Reportar","text":"Relatórios periódicos com estado, desvios e recomendações."}]', '["Acompanhar","Validar","Reportar"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('8cc9ff43-4632-461b-8e67-9e276b90f7fa', 'en', 'Site supervision', 'Monitoring of quality, compliance, quantities, schedule and the conditions agreed for the works.', 'Checking at the right moment costs less than correcting afterwards.', '["Monitoring of quality, compliance, quantities, schedule and the conditions agreed for the works.","Supervision represents the interest of whoever is paying for the build. We verify what is being executed against what was contracted and record what we find, so decisions are documented rather than remembered."]', '[{"title":"Monitor","text":"Presence on site and verification of execution against the design."},{"title":"Validate","text":"Technical compliance, quantities executed and contractual conditions."},{"title":"Report","text":"Periodic reports covering status, deviations and recommendations."}]', '["Monitor","Validate","Report"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('30eec123-7a06-4fb1-b5d3-c3f4c25bd6e8', 'reforma-e-manutencao', '04', 3, 1, NULL, '', '');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('30eec123-7a06-4fb1-b5d3-c3f4c25bd6e8', 'pt', 'Reforma e manutenção preventiva de edificações', 'Intervenções planeadas para adaptar espaços, corrigir patologias e prolongar a vida útil das edificações.', 'Reformar recupera valor. Manter protege o investimento.', '["Intervenções planeadas para adaptar espaços, corrigir patologias e prolongar a vida útil das edificações.","Um edifício degrada-se de forma previsível. Tratar a degradação cedo, segundo um plano, custa uma fracção do que custa reagir a uma patologia já instalada."]', '[{"title":"Reforma","text":"Adaptação de espaços e correcção de patologias existentes."},{"title":"Manutenção preventiva","text":"Intervenções programadas antes de o problema se tornar obra."},{"title":"Continuidade","text":"Acompanhamento ao longo do tempo, com histórico do que foi feito."}]', '["Reforma","Manutenção preventiva","Continuidade"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('30eec123-7a06-4fb1-b5d3-c3f4c25bd6e8', 'en', 'Refurbishment and preventive maintenance', 'Planned works to adapt spaces, correct defects and extend the service life of buildings.', 'Refurbishment recovers value. Maintenance protects the investment.', '["Planned works to adapt spaces, correct defects and extend the service life of buildings.","A building deteriorates predictably. Treating that deterioration early, to a plan, costs a fraction of reacting to a defect that has already taken hold."]', '[{"title":"Refurbishment","text":"Adaptation of spaces and correction of existing defects."},{"title":"Preventive maintenance","text":"Scheduled works before the problem becomes a construction job."},{"title":"Continuity","text":"Ongoing monitoring, with a record of what has been done."}]', '["Refurbishment","Preventive maintenance","Continuity"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('98456530-4847-433e-bf47-2f5ac674c9b4', 'estruturas-metalicas', '05', 4, 1, '/images/estrutura-metalica.jpg', 'Estrutura metálica montada em edifício em construção ao pôr do sol', 'Steel frame erected on a building under construction at sunset');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('98456530-4847-433e-bf47-2f5ac674c9b4', 'pt', 'Estruturas metálicas', 'Concepção, fabrico e montagem coordenados para alcançar segurança, desempenho e qualidade nos detalhes.', 'Estruturas metálicas com precisão.', '["Concepção, fabrico e montagem coordenados para alcançar segurança, desempenho e qualidade nos detalhes.","Numa estrutura metálica, o erro não se corrige com argamassa. A coordenação entre desenho, fabrico e montagem é o que separa uma estrutura que assenta à primeira de uma que consome semanas em ajustes."]', '[{"title":"Concepção","text":"Solução estrutural e pormenorização compatibilizadas com o projecto."},{"title":"Fabrico","text":"Produção controlada, com verificação dimensional antes de sair para obra."},{"title":"Montagem","text":"Sequência de montagem planeada, com condições de segurança definidas."}]', '["Concepção","Fabrico","Montagem"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('98456530-4847-433e-bf47-2f5ac674c9b4', 'en', 'Steel structures', 'Design, fabrication and erection coordinated to achieve safety, performance and quality in the details.', 'Steel structures built to precision.', '["Design, fabrication and erection coordinated to achieve safety, performance and quality in the details.","In a steel structure, an error cannot be corrected with mortar. Coordination between design, fabrication and erection is what separates a frame that fits first time from one that consumes weeks in adjustments."]', '[{"title":"Design","text":"Structural solution and detailing coordinated with the wider project."},{"title":"Fabrication","text":"Controlled production, with dimensional checks before it leaves for site."},{"title":"Erection","text":"A planned erection sequence, with safety conditions defined."}]', '["Design","Fabrication","Erection"]');
INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES ('e7860a3a-212d-4ffd-ae41-2b0aaa02d7f3', 'piscinas', '06', 5, 1, '/images/piscina.jpg', 'Piscina integrada na arquitectura de uma moradia ao entardecer', 'Swimming pool integrated into the architecture of a house at dusk');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('e7860a3a-212d-4ffd-ae41-2b0aaa02d7f3', 'pt', 'Construção de piscinas', 'Da solução técnica aos acabamentos e sistemas de funcionamento, coordenamos cada etapa.', 'Piscinas pensadas como parte da arquitectura.', '["Da solução técnica aos acabamentos e sistemas de funcionamento, coordenamos cada etapa para entregar qualidade, integração e durabilidade.","Uma piscina é uma obra de engenharia com acabamento à vista. Estrutura, impermeabilização, hidráulica e revestimento têm de ser decididos em conjunto — é aí que se ganha ou perde a durabilidade."]', '[{"title":"Projecto","text":"Solução técnica integrada na arquitectura e no terreno."},{"title":"Construção","text":"Estrutura, impermeabilização e sistemas hidráulicos executados com controlo."},{"title":"Acabamento","text":"Revestimentos, equipamentos e ensaios de funcionamento antes da entrega."}]', '["Projecto","Construção","Acabamento"]');
INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES ('e7860a3a-212d-4ffd-ae41-2b0aaa02d7f3', 'en', 'Swimming pool construction', 'From the technical solution to finishes and plant, we coordinate every stage.', 'Pools designed as part of the architecture.', '["From the technical solution to the finishes and operating systems, we coordinate every stage to deliver quality, integration and durability.","A pool is an engineering work with an exposed finish. Structure, waterproofing, hydraulics and finishes have to be decided together — that is where durability is won or lost."]', '[{"title":"Design","text":"A technical solution integrated with the architecture and the site."},{"title":"Construction","text":"Structure, waterproofing and hydraulic systems executed under control."},{"title":"Finishing","text":"Finishes, equipment and commissioning tests before handover."}]', '["Design","Construction","Finishing"]');
