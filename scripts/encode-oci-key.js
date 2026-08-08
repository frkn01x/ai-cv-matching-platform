#!/usr/bin/env node

/**
 * Oracle Cloud Private Key Encoder
 * 
 * Bu script, Oracle Cloud private key (.pem) dosyasını
 * base64 formatına çevirir ve .env dosyasına eklenebilir hale getirir.
 * 
 * Kullanım:
 * node scripts/encode-oci-key.js /path/to/your-private-key.pem
 */

const fs = require('fs');
const path = require('path');

function encodePrivateKey(keyPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(keyPath)) {
      console.error('❌ Hata: Dosya bulunamadı:', keyPath);
      process.exit(1);
    }

    // Read the private key file
    const privateKey = fs.readFileSync(keyPath, 'utf8');

    // Validate PEM format
    if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY')) {
      console.error('❌ Hata: Geçersiz PEM formatı. Dosya bir private key içermiyor.');
      process.exit(1);
    }

    // Convert to base64
    const base64Key = Buffer.from(privateKey).toString('base64');

    console.log('\n✅ Oracle Cloud Private Key başarıyla encode edildi!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Aşağıdaki değeri .env dosyanıza ekleyin:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`OCI_PRIVATE_KEY_BASE64=${base64Key}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Bu değeri güvenli tutun! Kimseyle paylaşmayın.\n');

    // Optionally write to a file
    const outputPath = path.join(__dirname, '..', 'oci-key-base64.txt');
    fs.writeFileSync(outputPath, `OCI_PRIVATE_KEY_BASE64=${base64Key}\n`);
    console.log(`💾 Ayrıca şu dosyaya kaydedildi: ${outputPath}`);
    console.log('   (Bu dosyayı .env\'ye kopyaladıktan sonra silin!)\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('');
  console.log('🔑 Oracle Cloud Private Key Encoder');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Kullanım:');
  console.log('  node scripts/encode-oci-key.js <private-key-path>');
  console.log('');
  console.log('Örnek:');
  console.log('  node scripts/encode-oci-key.js ~/Downloads/oraclecloud_api_key.pem');
  console.log('');
  console.log('Windows Örnek:');
  console.log('  node scripts/encode-oci-key.js C:\\Users\\YourName\\Downloads\\oraclecloud_api_key.pem');
  console.log('');
  process.exit(1);
}

const keyPath = args[0];
encodePrivateKey(keyPath);
