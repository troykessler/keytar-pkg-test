import crypto from "crypto";
import bcrypt from "bcryptjs";
import prompts from "prompts";
import fs from "fs";

const encryptionType = "aes-256-cbc";
const encryptionEncoding = "base64";
const bufferEncryption = "utf-8";

interface IFile {
  passhash: string;
  salt: string;
  iv: string;
  content: string;
}

class FileBackend {
  public async add(name: string, secret: string) {
    if (!secret) {
      console.log("Secret can not be empty");
      return;
    }

    if (!fs.existsSync("./wallet.info")) {
      await this.createFileBackend();
    }

    try {
      const file = this.readFile();
      const password = await this.validatePassword();

      let content = JSON.parse(
        this.aesDecrypt(file.content, password, file.salt, file.iv)
      );

      if (content[name]) {
        console.log(`Key with name ${name} already found. Overriding ...`);
      }

      file.content = this.aesEncrypt(
        JSON.stringify({ ...content, [name]: secret }),
        password,
        file.salt,
        file.iv
      );
      this.writeFile(file);

      console.log(`Added key: ${name}`);
    } catch (err) {
      console.log(`Could not add key: ${err}`);
    }
  }

  public async remove(name: string) {
    if (!fs.existsSync("./wallet.info")) {
      await this.createFileBackend();
    }

    try {
      const file = this.readFile();
      const password = await this.validatePassword();

      let content = JSON.parse(
        this.aesDecrypt(file.content, password, file.salt, file.iv)
      );

      if (!content[name]) {
        console.log(`Key with name ${name} not found`);
        return;
      }

      delete content[name];

      file.content = this.aesEncrypt(
        JSON.stringify(content),
        password,
        file.salt,
        file.iv
      );
      this.writeFile(file);

      console.log(`Removed key: ${name}`);
    } catch (err) {
      console.log(`Could not add key: ${err}`);
    }
  }

  public async show(name: string) {
    if (!fs.existsSync("./wallet.info")) {
      await this.createFileBackend();
    }

    try {
      const file = this.readFile();
      const password = await this.validatePassword();

      let content = JSON.parse(
        this.aesDecrypt(file.content, password, file.salt, file.iv)
      );

      if (!content[name]) {
        console.log(`Key with name ${name} not found`);
        return;
      }

      console.log(content[name]);
    } catch (err) {
      console.log(`Could not list keys: ${err}`);
    }
  }

  public async get(name: string): Promise<string | null> {
    if (!fs.existsSync("./wallet.info")) {
      await this.createFileBackend();
    }

    try {
      const file = this.readFile();
      const password = await this.validatePassword();

      let content = JSON.parse(
        this.aesDecrypt(file.content, password, file.salt, file.iv)
      );

      if (!content[name]) {
        return null;
      }

      return content[name];
    } catch (err) {
      return null;
    }
  }

  public async list() {
    if (!fs.existsSync("./wallet.info")) {
      await this.createFileBackend();
    }

    try {
      const file = this.readFile();
      const password = await this.validatePassword();

      let content = JSON.parse(
        this.aesDecrypt(file.content, password, file.salt, file.iv)
      );

      const keys = Object.keys(content);

      if (keys.length) {
        for (let key of Object.keys(content)) {
          console.log(key);
        }
      } else {
        console.log(`Found ${Object.keys(content).length} keys`);
      }
    } catch (err) {
      console.log(`Could not list keys: ${err}`);
    }
  }

  private writeFile(file: IFile): void {
    const content = Buffer.from(JSON.stringify(file)).toString(
      encryptionEncoding
    );

    fs.writeFileSync("./wallet.info", content);
  }

  private readFile(): IFile {
    const content = fs.readFileSync("./wallet.info", bufferEncryption);
    return JSON.parse(
      Buffer.from(content, encryptionEncoding).toString(bufferEncryption)
    );
  }

  private async createFileBackend(): Promise<void> {
    try {
      const password = await this.choosePassword();

      const passhash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      const salt = crypto.randomBytes(16).toString(encryptionEncoding);
      const iv = crypto.randomBytes(16).toString(encryptionEncoding);
      const content = this.aesEncrypt(JSON.stringify({}), password, salt, iv);

      this.writeFile({
        passhash,
        salt,
        iv,
        content,
      });
    } catch (err) {
      console.log(`Could not create file backend: ${err}`);
    }
  }

  private async validatePassword(): Promise<string> {
    const file = this.readFile();

    const { password } = await prompts(
      {
        type: "password",
        name: "password",
        message: "Enter your password",
        validate: (value) =>
          bcrypt.compareSync(value, file.passhash)
            ? true
            : `Password is incorrect`,
      },
      {
        onCancel: () => {
          throw Error("Aborted password input");
        },
      }
    );

    return password;
  }

  private async choosePassword(): Promise<string> {
    const { password1 } = await prompts(
      {
        type: "password",
        name: "password1",
        message: "Choose your password",
        validate: (value) =>
          value.length < 8
            ? `Password needs to be at least 8 characters`
            : true,
      },
      {
        onCancel: () => {
          throw Error("Aborted password input");
        },
      }
    );

    await prompts(
      {
        type: "password",
        name: "password2",
        message: "Repeat your password",
        validate: (pass2) => {
          return password1 === pass2 ? true : `Passwords need to be the same`;
        },
      },
      {
        onCancel: () => {
          throw Error("Aborted password input");
        },
      }
    );

    return password1;
  }

  private aesEncrypt(
    message: string,
    key: string,
    salt: string,
    iv: string
  ): string {
    const cipherKey = crypto.scryptSync(key, salt, 32);
    const cipherIv = Buffer.from(iv, encryptionEncoding);

    const cipher = crypto.createCipheriv(encryptionType, cipherKey, cipherIv);
    let encrypted = cipher.update(
      message,
      bufferEncryption,
      encryptionEncoding
    );
    encrypted += cipher.final(encryptionEncoding);
    return encrypted;
  }

  private aesDecrypt(message: string, key: string, salt: string, iv: string) {
    const buff = Buffer.from(message, encryptionEncoding);
    const cipherKey = crypto.scryptSync(key, salt, 32);
    const cipherIv = Buffer.from(iv, encryptionEncoding);

    const decipher = crypto.createDecipheriv(
      encryptionType,
      cipherKey,
      cipherIv
    );
    const deciphered =
      Buffer.from(decipher.update(buff)).toString(bufferEncryption) +
      Buffer.from(decipher.final()).toString(bufferEncryption);

    return deciphered;
  }
}

const main = async () => {
  const backend = new FileBackend();

  await backend.add("my_key", "my_secret");
  await backend.show("my_key");
};

main();
