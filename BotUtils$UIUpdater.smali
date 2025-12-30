.class public Lsinet/startup/inDriver/BotUtils$UIUpdater;
.super Ljava/lang/Object;
.implements Ljava/lang/Runnable;

.field final tv1:Landroid/widget/TextView;
.field final val1:Ljava/lang/String;
.field final tv2:Landroid/widget/TextView;
.field final val2:Ljava/lang/String;

.method public constructor <init>(Landroid/widget/TextView;Ljava/lang/String;Landroid/widget/TextView;Ljava/lang/String;)V
    .locals 0
    .param p1, "tv1" # Landroid/widget/TextView;
    .param p2, "val1" # Ljava/lang/String;
    .param p3, "tv2" # Landroid/widget/TextView;
    .param p4, "val2" # Ljava/lang/String;
    
    .prologue
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->tv1:Landroid/widget/TextView;
    iput-object p2, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->val1:Ljava/lang/String;
    iput-object p3, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->tv2:Landroid/widget/TextView;
    iput-object p4, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->val2:Ljava/lang/String;
    return-void
.end method

.method public run()V
    .locals 2
    .prologue
    iget-object v0, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->tv1:Landroid/widget/TextView;
    iget-object v1, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->val1:Ljava/lang/String;
    invoke-virtual {v0, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    
    iget-object v0, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->tv2:Landroid/widget/TextView;
    iget-object v1, p0, Lsinet/startup/inDriver/BotUtils$UIUpdater;->val2:Ljava/lang/String;
    invoke-virtual {v0, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    return-void
.end method
