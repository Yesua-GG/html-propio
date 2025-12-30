.class public Lsinet/startup/inDriver/BotUtils$Worker;
.super Ljava/lang/Object;
.implements Ljava/lang/Runnable;

.field final tv1:Landroid/widget/TextView;
.field final tv2:Landroid/widget/TextView;

.method public constructor <init>(Landroid/widget/TextView;Landroid/widget/TextView;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lsinet/startup/inDriver/BotUtils$Worker;->tv1:Landroid/widget/TextView;
    iput-object p2, p0, Lsinet/startup/inDriver/BotUtils$Worker;->tv2:Landroid/widget/TextView;
    return-void
.end method

.method public run()V
    .locals 8
    .prologue
    
    :try_start_0
    new-instance v0, Ljava/net/URL;
    const-string v1, "https://asistente-web-r2qs.onrender.com/config?format=json"
    invoke-direct {v0, v1}, Ljava/net/URL;-><init>(Ljava/lang/String;)V
    
    invoke-virtual {v0}, Ljava/net/URL;->openConnection()Ljava/net/URLConnection;
    move-result-object v0
    check-cast v0, Ljava/net/HttpURLConnection;
    
    invoke-virtual {v0}, Ljava/net/HttpURLConnection;->getInputStream()Ljava/io/InputStream;
    move-result-object v0
    
    # Read Stream
    new-instance v1, Ljava/util/Scanner;
    invoke-direct {v1, v0}, Ljava/util/Scanner;-><init>(Ljava/io/InputStream;)V
    const-string v0, "\\A"
    invoke-virtual {v1, v0}, Ljava/util/Scanner;->useDelimiter(Ljava/lang/String;)Ljava/util/Scanner;
    move-result-object v1
    
    invoke-virtual {v1}, Ljava/util/Scanner;->hasNext()Z
    move-result v0
    if-eqz v0, :cond_empty
    invoke-virtual {v1}, Ljava/util/Scanner;->next()Ljava/lang/String;
    move-result-object v0
    goto :goto_json
    :cond_empty
    const-string v0, "{}"
    :goto_json
    
    # Parse JSON
    new-instance v1, Lorg/json/JSONObject;
    invoke-direct {v1, v0}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V
    
    const-string v0, "min_price"
    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v2
    
    const-string v0, "max_pickup_dist"
    invoke-virtual {v1, v0}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v4
    
    # Prefix
    new-instance v0, Ljava/lang/StringBuilder;
    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V
    const-string v3, "Min: "
    invoke-virtual {v0, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v0
    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v0
    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v2
    
    new-instance v0, Ljava/lang/StringBuilder;
    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V
    const-string v3, "Max: "
    invoke-virtual {v0, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v0
    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v0
    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v4
    
    # Post Update
    new-instance v0, Landroid/os/Handler;
    invoke-static {}, Landroid/os/Looper;->getMainLooper()Landroid/os/Looper;
    move-result-object v1
    invoke-direct {v0, v1}, Landroid/os/Handler;-><init>(Landroid/os/Looper;)V
    
    new-instance v1, Lsinet/startup/inDriver/BotUtils$UIUpdater;
    iget-object v3, p0, Lsinet/startup/inDriver/BotUtils$Worker;->tv1:Landroid/widget/TextView;
    iget-object v5, p0, Lsinet/startup/inDriver/BotUtils$Worker;->tv2:Landroid/widget/TextView;
    invoke-direct {v1, v3, v2, v5, v4}, Lsinet/startup/inDriver/BotUtils$UIUpdater;-><init>(Landroid/widget/TextView;Ljava/lang/String;Landroid/widget/TextView;Ljava/lang/String;)V
    
    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z
    
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    
    :catch_0
    return-void
.end method
