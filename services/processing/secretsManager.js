const KeyVault = require('azure-keyvault');
const { AuthenticationContext } = require('adal-node');

const {
  KEY_VAULT_CLIENT_ID,
  KEY_VAULT_SECRET,
  KEY_VAULT_BASE_URL,
  KEY_VAULT_LUIS_APP_ID_KEY_ID,
  KEY_VAULT_LUIS_APP_KEY_KEY_ID,
  KEY_VAULT_SKYSCANNER_TOKEN_KEY_ID,
  KEY_VAULT_UNSPLASH_TOKEN_KEY_ID,
  KEY_VAULT_MICROSOFT_APP_ID_KEY_ID,
  KEY_VAULT_MICROSOFT_APP_PASSWORD_KEY_ID,
  KEY_VAULT_YELP_TOKEN_KEY_ID,
} = process.env;

const secretAuthenticator = (challenge, callback) => {
  try {
    const context = new AuthenticationContext(challenge.authorization);
    return context.acquireTokenWithClientCredentials(
      challenge.resource,
      KEY_VAULT_CLIENT_ID,
      KEY_VAULT_SECRET,
      (err, tokenResponse) => {
        if (err) throw err;

        const authorizationValue = `${tokenResponse.tokenType} ${tokenResponse.accessToken}`;
        return callback(null, authorizationValue);
      },
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getSecret = async (client, baseUrl, keyName, keyId) => (
  new Promise((resolve, reject) => {
    client.getSecret(baseUrl, keyName, keyId, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  })
);

const loadSecrets = async () => {
  const credentials = new KeyVault.KeyVaultCredentials(secretAuthenticator);
  const client = new KeyVault.KeyVaultClient(credentials);

  const LUIS_APP_ID = (await getSecret(client, KEY_VAULT_BASE_URL, 'LUIS-APP-ID', KEY_VAULT_LUIS_APP_ID_KEY_ID)).value;
  const LUIS_APP_KEY = (await getSecret(client, KEY_VAULT_BASE_URL, 'LUIS-APP-KEY', KEY_VAULT_LUIS_APP_KEY_KEY_ID)).value;
  const SKYSCANNER_TOKEN = (await getSecret(client, KEY_VAULT_BASE_URL, 'SKYSCANNER-TOKEN', KEY_VAULT_SKYSCANNER_TOKEN_KEY_ID)).value;
  const UNSPLASH_TOKEN = (await getSecret(client, KEY_VAULT_BASE_URL, 'UNSPLASH-TOKEN', KEY_VAULT_UNSPLASH_TOKEN_KEY_ID)).value;
  const MICROSOFT_APP_ID = (await getSecret(client, KEY_VAULT_BASE_URL, 'MICROSOFT-APP-ID', KEY_VAULT_MICROSOFT_APP_ID_KEY_ID)).value;
  const MICROSOFT_APP_PASSWORD = (await getSecret(client, KEY_VAULT_BASE_URL, 'MICROSOFT-APP-PASSWORD', KEY_VAULT_MICROSOFT_APP_PASSWORD_KEY_ID)).value;
  const YELP_TOKEN = (await getSecret(client, KEY_VAULT_BASE_URL, 'YELP_TOKEN', KEY_VAULT_YELP_TOKEN_KEY_ID)).value;
  return {
    LUIS_APP_ID,
    LUIS_APP_KEY,
    SKYSCANNER_TOKEN,
    UNSPLASH_TOKEN,
    MICROSOFT_APP_ID,
    MICROSOFT_APP_PASSWORD,
    YELP_TOKEN,
  };
};

module.exports = {
  loadSecrets,
};
