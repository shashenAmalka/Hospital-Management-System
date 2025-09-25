// Quick test for doctor search word boundary fix
// This tests the actual regex logic we implemented

function testDoctorSearch() {
    console.log('=== DOCTOR SEARCH WORD BOUNDARY TEST ===');
    
    const doctorNames = [
        'john smith',
        'sarah johnson',
        'robert williams',
        'johnson kelly',
        'john doe'
    ];
    
    const queries = ['john', 'johnson', 'smith', 'johnson kelly'];
    
    queries.forEach(query => {
        console.log(`\nTesting query: "${query}"`);
        
        doctorNames.forEach(name => {
            let matches = false;
            
            if (query.includes(' ')) {
                // Multi-word query: search full name
                matches = name.includes(query);
            } else {
                // Single word query: use exact word matching
                const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                matches = wordBoundaryRegex.test(name);
            }
            
            console.log(`  "${name}" matches: ${matches}`);
        });
    });
}

testDoctorSearch();