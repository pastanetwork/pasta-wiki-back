CREATE DATABASE "pasta-wiki-manager";

\c pasta-wiki-manager;

CREATE SCHEMA IF NOT EXISTS articles;
CREATE SCHEMA IF NOT EXISTS perms;
CREATE SCHEMA IF NOT EXISTS users;

CREATE TABLE articles.langs_codes (
    lang_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lang_code VARCHAR(255) NOT NULL DEFAULT '',
    lang_name VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE articles.categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL DEFAULT '',
    lang_id INT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    category_ref VARCHAR(255) NOT NULL DEFAULT '',
    CONSTRAINT fk_categories_lang 
        FOREIGN KEY (lang_id) 
        REFERENCES articles.langs_codes(lang_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE articles.articles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    article_name VARCHAR(255) NOT NULL DEFAULT '',
    category_id INT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    lang_id INT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    article_ref VARCHAR(255) NOT NULL DEFAULT '',
    CONSTRAINT fk_articles_category 
        FOREIGN KEY (category_id) 
        REFERENCES articles.categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_articles_lang 
        FOREIGN KEY (lang_id) 
        REFERENCES articles.langs_codes(lang_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE perms.perms (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE perms.roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE perms.roles_perms (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id INT NOT NULL,
    perm_id INT NOT NULL,
    CONSTRAINT fk_roles_perms_role 
        FOREIGN KEY (role_id) 
        REFERENCES perms.roles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_roles_perms_perm 
        FOREIGN KEY (perm_id) 
        REFERENCES perms.perms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_role_perm UNIQUE (role_id, perm_id)
);

CREATE TABLE users.users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(32) NOT NULL DEFAULT '',
    email VARCHAR(32) NOT NULL DEFAULT '',
    password TEXT NOT NULL DEFAULT '',
    role_id INT NOT NULL DEFAULT 1,
    key_2fa TEXT NOT NULL DEFAULT '',
    definitive BOOLEAN NOT NULL DEFAULT FALSE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_users_role 
        FOREIGN KEY (role_id) 
        REFERENCES perms.roles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT unique_email UNIQUE (email)
);

CREATE TABLE users.connexion_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(32) NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    ip VARCHAR(32) NOT NULL DEFAULT '',
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(255) NOT NULL DEFAULT '',
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL DEFAULT '',
    CONSTRAINT fk_connexion_logs_user 
        FOREIGN KEY (user_id) 
        REFERENCES users.users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
INSERT INTO articles.langs_codes (lang_code,lang_name) VALUES 
    ('none','none'),
    ('en_us','English (US)'),
    ('fr_fr','Français (FR)'),
    ('de_de','Deutsch (DE)'),
    ('nl_nl','Nederlands (NL)'),
    ('es_es','Español (ES)'),
    ('pt_pt','Português (PT)'),
    ('it_it', 'Italiano (IT)');

INSERT INTO articles.categories (category_name,lang_id, enabled, category_ref) VALUES 
    ('none',1,false,'none');

INSERT INTO perms.perms (name) VALUES 
    ('dashboard_access'),
    ('category_publish'),
    ('category_edit'),
    ('category_delete'),
    ('article_publish'),
    ('article_edit'),
    ('article_delete'),
    ('article_get_advanced'),
    ('category_get_advanced'),
    ('administration_access'),
    ('admin_users_list_access');

INSERT INTO perms.roles (name) VALUES 
    ('user'),
    ('writer'),
    ('admin');

INSERT INTO perms.roles_perms (role_id, perm_id) VALUES 
    (2, 1),
    (2, 2),
    (2, 3),
    (2, 4),
    (2, 5),
    (2, 6),
    (2, 7),
    (2, 8),
    (2, 9);

INSERT INTO perms.roles_perms (role_id, perm_id) VALUES 
    (3, 1),
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 5),
    (3, 6),
    (3, 7),
    (3, 8),
    (3, 9),
    (3, 10),
    (3, 11);