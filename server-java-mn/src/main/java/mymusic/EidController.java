package mymusic;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Key;
import java.security.KeyFactory;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import jakarta.annotation.PostConstruct;

import org.json.JSONObject;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.io.CharStreams;

import io.micronaut.context.annotation.Value;
import io.micronaut.core.util.StringUtils;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;

@Controller("/api")
public class EidController {
    private static final Logger logger = System.getLogger(EidController.class.getName());

    private static final int MAX_DECRYPT_BLOCK = 256;
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String CODE_EID_SUCCESS_CODE = "D00000";
    private static final String EID_AESKEY = "EID_AESKEY";
    private static final String AES_GCM_NOPADDING = "AES/GCM/NoPadding";

    @Value("${eid.server}")
    private String eidServer;

    @Value("${tsw.clientID}")
    private String clientID;

    @Value("${tsw.clientSecret}")
    private String clientSecret;

    @Value("${eid.privateKey.path}")
    private String privateKeyPath;

    private byte[] privateKey;

    private Cache<String, String> cache;

    @PostConstruct
    public void init() {
        logger.log(Level.INFO, "clientID = {}, clientSecret = {}, eid server = {}", clientID, clientSecret, eidServer);

        try {
            privateKey = Base64.getDecoder()
                    .decode(Files.readString(Paths.get(privateKeyPath))
                            .replace("\r\n", "")
                            .replace("\n", "")
                            .replace("-----BEGIN PRIVATE KEY-----", "")
                            .replace("-----END PRIVATE KEY-----", ""));
            logger.log(Level.INFO, "B/D privateKey initialized");
        } catch (IOException e) {
            logger.log(Level.ERROR, "HttpUtils init", e);
        }

        cache = CacheBuilder.newBuilder()
                .initialCapacity(5)
                .maximumSize(50)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .removalListener(notification -> logger.log(Level.INFO,
                        notification.getKey() + " " + notification.getValue()
                                + " is removed, cause: " + notification.getCause()))
                .build();

        logger.log(Level.INFO, "cache = " + cache);
    }

    private void refreshAESKey() throws Exception {
        String timestamp = String.valueOf(new Date().getTime());
        String signatureMethod = HMAC_SHA256;
        String nonce = UUID.randomUUID().toString().replace("-", "");

        String signMessage = clientID + signatureMethod + timestamp + nonce;

        String apiEndpoint = eidServer + "/v1";

        String signature = genHmacSHA256Signature(signMessage, clientSecret);
        logger.log(Level.INFO, "timestamp = {}, nonce = {}, signature = {}", timestamp, nonce, signature);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiEndpoint + "/security/getKey"))
                .header("clientID", clientID)
                .header("signatureMethod", signatureMethod)
                .header("timestamp", timestamp)
                .header("nonce", nonce)
                .header("signature", signature)
                .header("Content-Type", "application/json;charset=UTF-8")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JSONObject result = new JSONObject(response.body());

            String returnCode = result.getString("code");
            String message = result.getString("message");
            logger.log(Level.INFO, "reshAESKey returncode : {}, message : {}", returnCode, message);

            if (CODE_EID_SUCCESS_CODE.equals(returnCode)) {
                JSONObject conentJsonObject = result.getJSONObject("content");
                logger.log(Level.INFO, "start to decrypt data {}", conentJsonObject);
                String secretKey = conentJsonObject.getString("secretKey");

                String aesKey = Base64.getEncoder()
                        .encodeToString(rsaDecrypt(privateKey, Base64.getDecoder().decode(secretKey)));

                cache.put(EID_AESKEY, aesKey);
            }
        }
    }

    private String genHmacSHA256Signature(String message, String clientSecret) {
        try {
            Mac sha256HMAC = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec keySpec = new SecretKeySpec(clientSecret.getBytes(), HMAC_SHA256);
            sha256HMAC.init(keySpec);

            String hash = Base64.getEncoder().encodeToString(sha256HMAC.doFinal(message.getBytes())).replace("\r\n",
                    "");
            return URLEncoder.encode(hash, "UTF-8");
        } catch (Exception e) {
        }

        return "";
    }

    public static byte[] rsaDecrypt(byte[] privateKey, byte[] data) throws Exception {
        PKCS8EncodedKeySpec pkcs8KeySpec = new PKCS8EncodedKeySpec(privateKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        Key privateK = keyFactory.generatePrivate(pkcs8KeySpec);
        Cipher cipher = Cipher.getInstance(keyFactory.getAlgorithm());
        cipher.init(Cipher.DECRYPT_MODE, privateK);
        int inputLen = data.length;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int offSet = 0;
        if (data.length == 257) {
            data = Arrays.copyOfRange(data, 1, data.length);
            inputLen = data.length;
        }

        byte[] cache;
        int i = 0;

        while (inputLen - offSet > 0) {
            if (inputLen - offSet > MAX_DECRYPT_BLOCK) {
                cache = cipher.doFinal(data, offSet, MAX_DECRYPT_BLOCK);
            } else {
                cache = cipher.doFinal(data, offSet, inputLen - offSet);
            }
            out.write(cache, 0, cache.length);
            i++;
            offSet = i * MAX_DECRYPT_BLOCK;
        }
        byte[] decryptedData = out.toByteArray();
        out.close();
        return decryptedData;
    }

    @Post(uris = { "/callback/request-reauth", "/callback/request-profile", "/callback/request-eme",
            "/callback/request-signing" })
    public void handlCallback(HttpServletRequest request) throws Exception {
        String aesKey = cache.getIfPresent(EID_AESKEY);

        if (StringUtils.isEmpty(aesKey)) {
            refreshAESKey();
        }

        String body = CharStreams.toString(request.getReader());

        JSONObject result = new JSONObject(body);
        logger.log(Level.INFO, "result = " + result);

        String code = result.getString("code");
        String message = result.getString("message");

        logger.log(Level.INFO, "handlCallback returncode : {}, message : {}", code, message);

        if (CODE_EID_SUCCESS_CODE.equals(code)) {
            String content = result.getString("content");

            byte[] decryptedContent = aesDecrypt(Base64.getDecoder().decode(content),
                    Base64.getDecoder().decode(aesKey));

            JSONObject contentJson = new JSONObject(decryptedContent).getJSONObject("content");
            String businessId = contentJson.getString("businessID");

            cache.put(businessId, body);
        }
    }

    public static byte[] aesDecrypt(byte[] content, byte[] key) {
        SecretKeySpec skeySpec = new SecretKeySpec(key, "AES");
        ByteBuffer byteBuffer = ByteBuffer.wrap(content);
        int ivLength = byteBuffer.getInt();
        if (ivLength != 12) {
            throw new IllegalArgumentException("invalid iv length");
        }

        try {
            byte[] iv = new byte[ivLength];
            byteBuffer.get(iv);
            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);
            Cipher cipher = Cipher.getInstance(AES_GCM_NOPADDING);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, skeySpec, parameterSpec);
            byte[] original = cipher.doFinal(cipherText);
            // return new String(original);
            return original;
        } catch (Exception e) {
        }

        return null;
    }
}