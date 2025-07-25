const { exec } = require('child_process');

exec('node scripts/diagnosisDatabase.js', (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('STDOUT:', stdout);
    if (stderr) {
        console.error('STDERR:', stderr);
    }
});
