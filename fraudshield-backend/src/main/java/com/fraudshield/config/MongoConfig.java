package com.fraudshield.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    public static final String DATABASE_NAME = "fraudshield";

    private static final String DEFAULT_ATLAS_URI = 
        "mongodb://vanshitripathi19_db_user:van19shi@ac-pk9ae1t-shard-00-00.5scdnrp.mongodb.net:27017,ac-pk9ae1t-shard-00-01.5scdnrp.mongodb.net:27017,ac-pk9ae1t-shard-00-02.5scdnrp.mongodb.net:27017/fraudshield?ssl=true&replicaSet=atlas-50dij2-shard-0&authSource=admin";

    @Value("${spring.data.mongodb.uri:${MONGO_URI:}}")
    private String configuredUri;

    private String getSanitizedUri() {
        String uri = configuredUri;

        if (uri == null || uri.isBlank()) {
            uri = System.getenv("MONGO_URI");
        }

        if (uri != null) {
            uri = uri.trim();
            while ((uri.startsWith("\"") && uri.endsWith("\"")) || 
                   (uri.startsWith("'") && uri.endsWith("'"))) {
                uri = uri.substring(1, uri.length() - 1).trim();
            }
        }

        if (uri == null || uri.isBlank()) {
            log.info("No MONGO_URI provided; using default MongoDB Atlas cluster URI");
            uri = DEFAULT_ATLAS_URI;
        }

        // Fix multi-host with mongodb+srv://
        if (uri.startsWith("mongodb+srv://") && uri.contains(",")) {
            log.warn("Detected multiple hosts with mongodb+srv://. Automatically correcting protocol to mongodb://");
            uri = "mongodb://" + uri.substring("mongodb+srv://".length());
        }

        // Ensure database name is included before query params if missing
        if (uri.contains("/?")) {
            uri = uri.replace("/?", "/" + DATABASE_NAME + "?");
        } else if (!uri.contains("/" + DATABASE_NAME)) {
            int queryIdx = uri.indexOf("?");
            if (queryIdx != -1) {
                uri = uri.substring(0, queryIdx) + "/" + DATABASE_NAME + uri.substring(queryIdx);
            } else if (!uri.endsWith("/")) {
                uri = uri + "/" + DATABASE_NAME;
            }
        }

        return uri;
    }

    @Bean
    @Primary
    public MongoClient mongoClient() {
        String uri = getSanitizedUri();
        log.info("Initializing MongoClient with target database '{}'", DATABASE_NAME);
        try {
            return MongoClients.create(new ConnectionString(uri));
        } catch (Exception ex) {
            log.error("Failed to initialize MongoClient with URI: {}. Falling back to default Atlas URI.", ex.getMessage());
            return MongoClients.create(new ConnectionString(DEFAULT_ATLAS_URI));
        }
    }

    @Bean
    @Primary
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        return new SimpleMongoClientDatabaseFactory(mongoClient, DATABASE_NAME);
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDatabaseFactory) {
        return new MongoTemplate(mongoDatabaseFactory);
    }
}
