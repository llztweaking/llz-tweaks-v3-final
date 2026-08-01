import { motion } from 'framer-motion'

export default function Terms() {
  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>LEGAL</small>
          <h1>Termos de Uso</h1>
          <p>Última atualização: julho de 2026.</p>
        </div>
      </header>

      <section className="card terms-content">
        <h3>1. Aceitação</h3>
        <p>Ao instalar ou usar o LLZ Tweaks, você concorda com estes Termos de Uso. Se não concordar, não instale ou desinstale o aplicativo.</p>

        <h3>2. O que o LLZ Tweaks faz</h3>
        <p>O LLZ Tweaks é um utilitário de otimização para Windows. Ele executa ajustes no sistema (como troca de plano de energia e limpeza de arquivos temporários) e exibe informações de diagnóstico do seu computador. Nenhuma ação é executada sem você clicar explicitamente no botão correspondente.</p>

        <h3>3. Licença de uso</h3>
        <p>O acesso é concedido por licença individual, vinculada a uma chave e a um dispositivo (HWID). A licença é pessoal e intransferível: compartilhar, revender ou usar a mesma chave em múltiplos dispositivos sem autorização pode resultar em suspensão ou banimento, sem aviso prévio.</p>

        <h3>4. Dados coletados</h3>
        <p>Para funcionar, o LLZ Tweaks coleta e armazena: seu usuário do Discord informado no login, um identificador do seu dispositivo (HWID), informações básicas de hardware (usadas só para exibição no Diagnóstico) e um histórico das ações executadas. Esses dados são usados exclusivamente para validar sua licença, dar suporte e prevenir abuso — não são vendidos a terceiros.</p>

        <h3>5. Pagamentos e reembolso</h3>
        <p>Não há reembolso após a ativação da licença (primeiro login bem-sucedido com a chave). Antes da ativação, dúvidas sobre a compra devem ser tratadas diretamente pelo canal onde a licença foi adquirida.</p>

        <h3>6. Suspensão e banimento</h3>
        <p>Licenças usadas em desacordo com estes termos — incluindo compartilhamento, tentativa de burlar a validação, ou uso abusivo — podem ser suspensas ou banidas a critério da administração, sem reembolso.</p>

        <h3>7. Sem garantias</h3>
        <p>O LLZ Tweaks altera configurações do sistema operacional. Embora as ações sejam desenhadas para serem seguras e reversíveis, o uso é por sua conta e risco. Não garantimos resultado de desempenho específico nem nos responsabilizamos por problemas decorrentes de uso indevido, conflito com outros softwares, ou falhas de hardware pré-existentes.</p>

        <h3>8. Alterações</h3>
        <p>Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas dentro do próprio aplicativo.</p>

        <h3>9. Contato</h3>
        <p>Dúvidas sobre estes termos podem ser enviadas pelo mesmo canal usado para adquirir sua licença.</p>
      </section>
    </motion.div>
  )
}
