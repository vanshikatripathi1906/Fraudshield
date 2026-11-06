package com.fraudshield.config;

import com.mongodb.ConnectionString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoConnectionDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    private static final String DEFAULT_ATLAS_URI = 
        "mongodb://vanshitripathi19_db_user:van19shi@ac-pk9ae1t-shard-00-00.5scdnrp.mongodb.net:27017,ac-pk9ae1t-shard-00-01.5scdnrp.mongodb.net:27017,ac-pk9ae1t-shard-00-02.5scdnrp.mongodb.net:27017/fraudshield?ssl=true&replicaSet=atlas-50dij2-shard-0&authSource=admin";

    @Value("${spring.data.mongodb.uri:${MONGO_URI:}}")
    private String configuredUri;

    @Bean
    public MongoConnectionDetails mongoConnectionDetails() {
        return new MongoConnectionDetails() {
            @Override
            public ConnectionString getConnectionString() {
                String uri = configuredUri;

                // Check direct system environment if property was empty
                if (uri == null || uri.isBlank()) {
                    uri = System.getenv("MONGO_URI");
                }

                if (uri != null) {
                    uri = uri.trim();
                    // Strip quotes if user wrapped the value in quotes in Render / Railway env dashboard
                    while ((uri.startsWith("\"") && uri.endsWith("\"")) || 
                           (uri.startsWith("'") && uri.endsWith("'"))) {
                        uri = uri.substring(1, uri.length() - 1).trim();
                    }
                }

                if (uri == null || uri.isBlank()) {
                    log.info("No custom MONGO_URI provided; using default MongoDB Atlas cluster URI");
                    uri = DEFAULT_ATLAS_URI;
                } else {
                    log.info("Using sanitized MongoDB URI starting with: {}", 
                        uri.startsWith("mongodb+srv://") ? "mongodb+srv://..." : "mongodb://...");
                }

                return new ConnectionString(uri);
            }
        };
    }
}
