.class public Lsinet/startup/inDriver/BotUtils;
.super Ljava/lang/Object;

.method public static initBotInfo(Landroid/view/View;)V
    .locals 6
    .param p0, "view" # Landroid/view/View;

    .prologue
    
    # 1. Context y Resources
    invoke-virtual {p0}, Landroid/view/View;->getContext()Landroid/content/Context;
    move-result-object v0
    invoke-virtual {v0}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;
    move-result-object v1
    invoke-virtual {v0}, Landroid/content/Context;->getPackageName()Ljava/lang/String;
    move-result-object v2
    
    # 2. Find bot_min_price
    const-string v3, "bot_min_price"
    const-string v4, "id"
    invoke-virtual {v1, v3, v4, v2}, Landroid/content/res/Resources;->getIdentifier(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)I
    move-result v3
    
    if-nez v3, :cond_not_found
    
    invoke-virtual {p0, v3}, Landroid/view/View;->findViewById(I)Landroid/view/View;
    move-result-object v3
    check-cast v3, Landroid/widget/TextView;
    
    # 3. Find bot_max_dist
    const-string v4, "bot_max_dist"
    const-string v5, "id"
    invoke-virtual {v1, v4, v5, v2}, Landroid/content/res/Resources;->getIdentifier(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)I
    move-result v4
    
    if-nez v4, :cond_not_found
    
    invoke-virtual {p0, v4}, Landroid/view/View;->findViewById(I)Landroid/view/View;
    move-result-object v4
    check-cast v4, Landroid/widget/TextView;
    
    # 4. Check nulls
    if-eqz v3, :cond_not_found
    if-nez v4, :cond_start
    
    :cond_not_found
    return-void
    
    :cond_start
    # 5. Start Worker Thread
    new-instance v0, Lsinet/startup/inDriver/BotUtils$Worker;
    invoke-direct {v0, v3, v4}, Lsinet/startup/inDriver/BotUtils$Worker;-><init>(Landroid/widget/TextView;Landroid/widget/TextView;)V
    
    new-instance v1, Ljava/lang/Thread;
    invoke-direct {v1, v0}, Ljava/lang/Thread;-><init>(Ljava/lang/Runnable;)V
    invoke-virtual {v1}, Ljava/lang/Thread;->start()V
    
    return-void
.end method
